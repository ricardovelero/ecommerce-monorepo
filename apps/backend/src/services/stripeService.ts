import Stripe from "stripe";

import { env } from "@/config/env";
import { HttpError } from "@/utils/httpError";

let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!env.STRIPE_SECRET_KEY) {
    throw new HttpError(500, "Stripe is not configured");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(env.STRIPE_SECRET_KEY);
  }

  return stripeClient;
}

export function getStripeWebhookSecret(): string {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    throw new HttpError(500, "Stripe webhook secret is not configured");
  }

  return env.STRIPE_WEBHOOK_SECRET;
}
