import type { Request, Response } from "express";
import Stripe from "stripe";

import { prisma } from "@/db/prisma";
import { logger } from "@/lib/logger";
import { registerWebhookEvent } from "@/services/checkoutService";
import { enqueueStripeWebhookJob } from "@/services/queue/orderQueue";
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

function getStripeObjectId(event: Stripe.Event): string | null {
  const object = event.data.object as { id?: unknown };
  return typeof object.id === "string" ? object.id : null;
}

export async function stripeWebhookController(req: Request, res: Response): Promise<void> {
  const stripe = getStripeClient();
  const signature = getSignature(req);
  const rawBody = getRawBody(req);

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, getStripeWebhookSecret());
  } catch (error) {
    logger.warn({ err: error, requestId: req.requestId }, "Stripe webhook signature verification failed");
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

  const stripeObjectId = getStripeObjectId(event);

  if (!stripeObjectId) {
    logger.warn({ stripeEventId: event.id, eventType: event.type }, "Stripe event does not contain object id");
    res.status(200).json({ received: true, ignored: true });
    return;
  }

  try {
    await enqueueStripeWebhookJob({
      stripeEventId: event.id,
      stripeEventType: event.type,
      stripeObjectId,
    });
  } catch (error) {
    await prisma.webhookEvent.deleteMany({
      where: { eventId: event.id },
    });
    throw error;
  }

  res.status(200).json({ received: true, queued: true });
}
