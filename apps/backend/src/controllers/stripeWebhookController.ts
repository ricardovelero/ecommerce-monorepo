import type { Request, Response } from "express";
import Stripe from "stripe";

import { prisma } from "@/db/prisma";
import {
  processCheckoutSessionCompleted,
  processPaymentIntentFailed,
  registerWebhookEvent,
} from "@/services/checkoutService";
import { getStripeClient, getStripeWebhookSecret } from "@/services/stripeService";
import { HttpError } from "@/utils/httpError";

function getSignature(req: Request): string {
  const signature = req.headers["stripe-signature"];
  if (!signature || Array.isArray(signature)) {
    throw new HttpError(400, "Missing stripe signature");
  }

  return signature;
}

function getRawBody(req: Request): Buffer {
  if (!Buffer.isBuffer(req.body)) {
    throw new HttpError(400, "Expected raw webhook body");
  }

  return req.body;
}

export async function stripeWebhookController(req: Request, res: Response): Promise<void> {
  const stripe = getStripeClient();
  const signature = getSignature(req);
  const rawBody = getRawBody(req);

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, getStripeWebhookSecret());
  } catch (error) {
    console.error("Stripe webhook signature verification failed", error);
    throw new HttpError(400, "Invalid webhook signature");
  }

  const isNewEvent = await registerWebhookEvent({
    provider: "stripe",
    eventId: event.id,
    eventType: event.type,
  });

  if (!isNewEvent) {
    res.status(200).json({ received: true, deduplicated: true });
    return;
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        await processCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      }
      case "payment_intent.payment_failed": {
        await processPaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      }
      default:
        break;
    }
  } catch (error) {
    await prisma.webhookEvent.deleteMany({
      where: { eventId: event.id },
    });
    throw error;
  }

  res.status(200).json({ received: true });
}
