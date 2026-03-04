import { CartStatus, OrderStatus, Prisma } from "@prisma/client";
import Stripe from "stripe";

import { prisma } from "@/db/prisma";
import { logger } from "@/lib/logger";
import { sendOrderConfirmationEmail } from "@/services/emailService";

function normalizeEmail(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  return normalized || null;
}

function toStringOrNull(value: string | Stripe.PaymentIntent | null): string | null {
  if (!value) {
    return null;
  }

  return typeof value === "string" ? value : value.id;
}

function calculateSubtotal(items: Array<{ quantity: number; product: { priceCents: number } }>): number {
  return items.reduce((acc, item) => acc + item.product.priceCents * item.quantity, 0);
}

function getSingleCurrency(items: Array<{ product: { currency: string } }>): string {
  const firstCurrency = items[0]?.product.currency ?? "EUR";
  const hasMixedCurrency = items.some((item) => item.product.currency !== firstCurrency);

  if (hasMixedCurrency) {
    throw new Error("Cart has mixed currencies");
  }

  return firstCurrency;
}

async function createOrderFromCart(input: {
  tx: Prisma.TransactionClient;
  cart: {
    id: string;
    userId: string;
    items: Array<{
      quantity: number;
      product: {
        id: string;
        name: string;
        priceCents: number;
        currency: string;
      };
    }>;
  };
  stripeCheckoutSessionId: string;
  stripePaymentIntentId: string | null;
  stripeCustomerId: string | null;
}): Promise<{ orderId: string; totalCents: number; currency: string }> {
  const subtotalCents = calculateSubtotal(input.cart.items);
  const currency = getSingleCurrency(input.cart.items);

  for (const item of input.cart.items) {
    const updated = await input.tx.product.updateMany({
      where: {
        id: item.product.id,
        stock: {
          gte: item.quantity,
        },
      },
      data: {
        stock: {
          decrement: item.quantity,
        },
      },
    });

    if (updated.count === 0) {
      throw new Error(`Insufficient stock for product ${item.product.id}`);
    }
  }

  const order = await input.tx.order.create({
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

  return { orderId: order.id, totalCents: order.totalCents, currency: order.currency };
}

export async function processCheckoutSessionCompleted(input: {
  stripe: Stripe;
  stripeSessionId: string;
  stripeEventId: string;
}): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const session = await input.stripe.checkout.sessions.retrieve(input.stripeSessionId, {
      expand: ["customer"],
    });

    const cartId = session.metadata?.cartId ?? session.client_reference_id;
    const userId = session.metadata?.userId;

    if (!cartId || !userId) {
      logger.warn({ stripeEventId: input.stripeEventId, sessionId: session.id }, "Stripe session missing required metadata");
      return;
    }

    const stripePaymentIntentId = toStringOrNull(session.payment_intent as string | Stripe.PaymentIntent | null);
    const stripeCustomerId = typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
    const checkoutEmail = normalizeEmail(session.customer_details?.email);

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
      logger.warn({ stripeEventId: input.stripeEventId, sessionId: session.id, cartId }, "Stripe webhook cart not found");
      return;
    }

    if (cart.userId !== userId) {
      logger.warn(
        { stripeEventId: input.stripeEventId, sessionId: session.id, cartId, cartUserId: cart.userId, metadataUserId: userId },
        "Stripe webhook cart user mismatch",
      );
      return;
    }

    if (cart.status !== CartStatus.OPEN) {
      return;
    }

    if (cart.items.length === 0) {
      logger.warn({ stripeEventId: input.stripeEventId, sessionId: session.id, cartId }, "Stripe webhook cart is empty");
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

    const order = await createOrderFromCart({
      tx,
      cart,
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId,
      stripeCustomerId,
    });

    if (checkoutEmail) {
      await sendOrderConfirmationEmail({
        to: checkoutEmail,
        orderId: order.orderId,
        totalCents: order.totalCents,
        currency: order.currency,
      });
    }
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
