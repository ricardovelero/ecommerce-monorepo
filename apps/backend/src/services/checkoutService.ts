import { createHash } from "node:crypto";

import { CartStatus, Prisma } from "@prisma/client";

import { env } from "@/config/env";
import { prisma } from "@/db/prisma";
import { enqueueStripeWebhookJob } from "@/services/queue/orderQueue";
import { getStripeClient } from "@/services/stripeService";
import { HttpError } from "@/utils/httpError";

interface CheckoutCartItem {
  quantity: number;
  product: {
    id: string;
    name: string;
    priceCents: number;
    currency: string;
    stock: number;
  };
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

function assertStockAvailability(items: CheckoutCartItem[]): void {
  const unavailable = items.find((item) => item.quantity > item.product.stock);
  if (unavailable) {
    throw new HttpError(409, `Insufficient stock for product ${unavailable.product.name}`);
  }
}

function buildCheckoutIdempotencyKey(input: {
  cartId: string;
  subtotalCents: number;
  items: Array<{ productId: string; quantity: number }>;
  lang: "es" | "en";
  email?: string | null;
  metadata: Record<string, string>;
}): string {
  const fingerprint = JSON.stringify({
    subtotalCents: input.subtotalCents,
    items: input.items
      .map((item) => `${item.productId}:${item.quantity}`)
      .sort(),
    lang: input.lang,
    email: input.email?.trim().toLowerCase() ?? "guest",
    metadata: Object.entries(input.metadata).sort(([left], [right]) => left.localeCompare(right)),
  });

  const digest = createHash("sha256").update(fingerprint).digest("hex");
  return `checkout:${input.cartId}:${digest}`;
}

async function findReusableStripeCustomerId(userId: string): Promise<string | null> {
  const previousOrder = await prisma.order.findFirst({
    where: {
      userId,
      stripeCustomerId: {
        not: null,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      stripeCustomerId: true,
    },
  });

  return previousOrder?.stripeCustomerId ?? null;
}

export async function createCheckoutSession(input: {
  userId: string;
  email?: string | null;
  lang?: string;
  customerName: string;
  phone?: string | null;
  shippingAddressLine1: string;
  shippingAddressLine2?: string | null;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  shippingNotes?: string | null;
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

  assertStockAvailability(cart.items);

  const currency = getSingleCurrency(cart.items);
  const subtotalCents = calculateSubtotal(cart.items);
  const lang = assertLanguage(input.lang);

  const stripe = getStripeClient();
  const reusableStripeCustomerId = await findReusableStripeCustomerId(input.userId);
  const metadata: Record<string, string> = {
    userId: input.userId,
    cartId: cart.id,
    customerName: input.customerName,
    ...(input.phone ? { phone: input.phone } : {}),
    shippingAddressLine1: input.shippingAddressLine1,
    ...(input.shippingAddressLine2 ? { shippingAddressLine2: input.shippingAddressLine2 } : {}),
    shippingCity: input.shippingCity,
    shippingPostalCode: input.shippingPostalCode,
    shippingCountry: input.shippingCountry,
    ...(input.shippingNotes ? { shippingNotes: input.shippingNotes } : {}),
  };
  const idempotencyKey = buildCheckoutIdempotencyKey({
    cartId: cart.id,
    subtotalCents,
    items: cart.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    })),
    lang,
    email: input.email,
    metadata,
  });

  const session = await stripe.checkout.sessions.create(
    {
      mode: "payment",
      ...(input.email ? { customer_email: input.email } : {}),
      ...(reusableStripeCustomerId
        ? {
            customer: reusableStripeCustomerId,
          }
        : {
            customer_creation: "always" as const,
          }),
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
      metadata,
      client_reference_id: cart.id,
      payment_intent_data: {
        metadata,
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

export async function reconcileCheckoutSession(input: {
  userId: string;
  sessionId: string;
}): Promise<{ status: "queued" | "existing" | "pending_payment" }> {
  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.retrieve(input.sessionId);

  const metadataUserId = session.metadata?.userId;
  if (!metadataUserId || metadataUserId !== input.userId) {
    throw new HttpError(404, "Checkout session not found");
  }

  const existingOrder = await prisma.order.findFirst({
    where: {
      OR: [
        {
          stripeCheckoutSessionId: session.id,
        },
        ...(typeof session.payment_intent === "string"
          ? [
              {
                stripePaymentIntentId: session.payment_intent,
              },
            ]
          : []),
      ],
    },
    select: { id: true },
  });

  if (existingOrder) {
    return { status: "existing" };
  }

  if (session.payment_status !== "paid") {
    return { status: "pending_payment" };
  }

  await enqueueStripeWebhookJob({
    stripeEventId: `manual-checkout-session:${session.id}`,
    stripeEventType: "checkout.session.completed",
    stripeObjectId: session.id,
  });

  return { status: "queued" };
}

export async function getCheckoutSessionStatus(input: {
  userId: string;
  sessionId: string;
}): Promise<{ status: "existing" | "processing" | "pending_payment" }> {
  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.retrieve(input.sessionId);

  const metadataUserId = session.metadata?.userId;
  if (!metadataUserId || metadataUserId !== input.userId) {
    throw new HttpError(404, "Checkout session not found");
  }

  const existingOrder = await prisma.order.findFirst({
    where: {
      OR: [
        {
          stripeCheckoutSessionId: session.id,
        },
        ...(typeof session.payment_intent === "string"
          ? [
              {
                stripePaymentIntentId: session.payment_intent,
              },
            ]
          : []),
      ],
    },
    select: { id: true },
  });

  if (existingOrder) {
    return { status: "existing" };
  }

  if (session.payment_status !== "paid") {
    return { status: "pending_payment" };
  }

  return { status: "processing" };
}
