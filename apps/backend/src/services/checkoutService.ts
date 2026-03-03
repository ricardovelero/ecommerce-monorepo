import { CartStatus, OrderStatus, Prisma } from "@prisma/client";
import Stripe from "stripe";

import { env } from "@/config/env";
import { prisma } from "@/db/prisma";
import { getStripeClient } from "@/services/stripeService";
import { HttpError } from "@/utils/httpError";

interface CheckoutCartItem {
  quantity: number;
  product: {
    id: string;
    name: string;
    priceCents: number;
    currency: string;
  };
}

interface CheckoutCart {
  id: string;
  userId: string;
  status: CartStatus;
  items: CheckoutCartItem[];
}

function assertLanguage(value: string | undefined): "es" | "en" {
  return value === "en" ? "en" : "es";
}

function calculateSubtotal(items: CheckoutCartItem[]): number {
  return items.reduce((acc, item) => acc + item.product.priceCents * item.quantity, 0);
}

function getSingleCurrency(items: CheckoutCartItem[]): string {
  const firstCurrency = items[0]?.product.currency ?? "EUR";
  const hasMixedCurrency = items.some((item) => item.product.currency !== firstCurrency);

  if (hasMixedCurrency) {
    throw new HttpError(400, "Cart has mixed currencies");
  }

  return firstCurrency;
}

function toStringOrNull(value: string | { id: string } | null): string | null {
  if (!value) {
    return null;
  }

  return typeof value === "string" ? value : value.id;
}

function normalizeEmail(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  return normalized || null;
}

export async function createCheckoutSession(input: {
  userId: string;
  email?: string | null;
  lang?: string;
}): Promise<{ url: string }> {
  const cart = await prisma.cart.findFirst({
    where: {
      userId: input.userId,
      status: CartStatus.OPEN,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new HttpError(400, "Open cart with items is required for checkout");
  }

  const currency = getSingleCurrency(cart.items);
  const subtotalCents = calculateSubtotal(cart.items);
  const lang = assertLanguage(input.lang);

  const stripe = getStripeClient();
  const idempotencyKey = `checkout:${cart.id}:${subtotalCents}:${cart.items
    .map((item) => `${item.productId}:${item.quantity}`)
    .sort()
    .join(",")}`;

  const session = await stripe.checkout.sessions.create(
    {
      mode: "payment",
      ...(input.email ? { customer_email: input.email } : {}),
      line_items: cart.items.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: currency.toLowerCase(),
          unit_amount: item.product.priceCents,
          product_data: {
            name: item.product.name,
          },
        },
      })),
      metadata: {
        userId: input.userId,
        cartId: cart.id,
      },
      client_reference_id: cart.id,
      payment_intent_data: {
        metadata: {
          userId: input.userId,
          cartId: cart.id,
        },
      },
      success_url: `${env.APP_URL}/${lang}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.APP_URL}/${lang}/checkout/cancel`,
    },
    { idempotencyKey },
  );

  if (!session.url) {
    throw new HttpError(500, "Stripe did not return a checkout URL");
  }

  return { url: session.url };
}

async function createOrderFromCart(input: {
  tx: Prisma.TransactionClient;
  cart: CheckoutCart;
  stripeCheckoutSessionId: string;
  stripePaymentIntentId: string | null;
  stripeCustomerId: string | null;
}): Promise<void> {
  const subtotalCents = calculateSubtotal(input.cart.items);
  const currency = getSingleCurrency(input.cart.items);

  await input.tx.order.create({
    data: {
      userId: input.cart.userId,
      status: OrderStatus.PAID,
      currency,
      subtotalCents,
      totalCents: subtotalCents,
      stripeCheckoutSessionId: input.stripeCheckoutSessionId,
      stripePaymentIntentId: input.stripePaymentIntentId,
      stripeCustomerId: input.stripeCustomerId,
      paidAt: new Date(),
      createdById: input.cart.userId,
      updatedById: input.cart.userId,
      items: {
        create: input.cart.items.map((item) => ({
          productId: item.product.id,
          nameSnapshot: item.product.name,
          priceCentsSnapshot: item.product.priceCents,
          quantity: item.quantity,
        })),
      },
    },
  });

  await input.tx.cart.update({
    where: { id: input.cart.id },
    data: { status: CartStatus.CHECKED_OUT },
  });
}

export async function processCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const cartId = session.metadata?.cartId ?? session.client_reference_id;
  const userId = session.metadata?.userId;

  if (!cartId || !userId) {
    console.warn("Stripe session missing required metadata", {
      sessionId: session.id,
      cartId,
      userId,
    });
    return;
  }

  const stripePaymentIntentId = toStringOrNull(session.payment_intent);
  const stripeCustomerId = typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
  const checkoutEmail = normalizeEmail(session.customer_details?.email);

  await prisma.$transaction(async (tx) => {
    const existingBySession = await tx.order.findUnique({
      where: { stripeCheckoutSessionId: session.id },
      select: { id: true },
    });

    if (existingBySession) {
      return;
    }

    if (stripePaymentIntentId) {
      const existingByPaymentIntent = await tx.order.findUnique({
        where: { stripePaymentIntentId },
        select: { id: true },
      });

      if (existingByPaymentIntent) {
        return;
      }
    }

    const cart = await tx.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      console.warn("Stripe webhook cart not found", { cartId, sessionId: session.id });
      return;
    }

    if (cart.userId !== userId) {
      console.warn("Stripe webhook cart user mismatch", {
        cartId,
        cartUserId: cart.userId,
        metadataUserId: userId,
      });
      return;
    }

    if (cart.status !== CartStatus.OPEN) {
      return;
    }

    if (cart.items.length === 0) {
      console.warn("Stripe webhook cart is empty", { cartId, sessionId: session.id });
      return;
    }

    if (checkoutEmail) {
      await tx.user.updateMany({
        where: {
          id: userId,
          email: null,
        },
        data: {
          email: checkoutEmail,
        },
      });
    }

    await createOrderFromCart({
      tx,
      cart,
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId,
      stripeCustomerId,
    });
  });
}

export async function processPaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  await prisma.order.updateMany({
    where: {
      stripePaymentIntentId: paymentIntent.id,
      status: {
        not: OrderStatus.PAID,
      },
    },
    data: {
      status: OrderStatus.FAILED,
    },
  });
}

export async function registerWebhookEvent(input: {
  provider: string;
  eventId: string;
  eventType: string;
}): Promise<boolean> {
  try {
    await prisma.webhookEvent.create({
      data: {
        provider: input.provider,
        eventId: input.eventId,
        eventType: input.eventType,
      },
    });
    return true;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return false;
    }

    throw error;
  }
}
