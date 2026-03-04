import {
  createRedisConnection,
  ORDER_QUEUE_NAME,
  type StripeWebhookJobData,
} from "@ecommerce/queue";
import { Worker } from "bullmq";
import Stripe from "stripe";

import { env } from "@/config/env";
import { prisma } from "@/db/prisma";
import { logger } from "@/lib/logger";
import {
  processCheckoutSessionCompleted,
  processPaymentIntentFailed,
} from "@/services/orderProcessingService";

const connection = createRedisConnection(env.REDIS_URL);
const stripe = new Stripe(env.STRIPE_SECRET_KEY);

const worker = new Worker<StripeWebhookJobData>(
  ORDER_QUEUE_NAME,
  async (job) => {
    logger.info(
      {
        jobId: job.id,
        stripeEventId: job.data.stripeEventId,
        stripeEventType: job.data.stripeEventType,
      },
      "Processing Stripe webhook job",
    );

    if (job.data.stripeEventType === "checkout.session.completed") {
      await processCheckoutSessionCompleted({
        stripe,
        stripeSessionId: job.data.stripeObjectId,
        stripeEventId: job.data.stripeEventId,
      });
      return;
    }

    if (job.data.stripeEventType === "payment_intent.payment_failed") {
      const paymentIntent = await stripe.paymentIntents.retrieve(job.data.stripeObjectId);
      await processPaymentIntentFailed(paymentIntent);
    }
  },
  {
    connection,
    concurrency: env.WORKER_CONCURRENCY,
  },
);

worker.on("completed", (job) => {
  logger.info({ jobId: job.id }, "Job completed");
});

worker.on("failed", (job, error) => {
  logger.error({ jobId: job?.id, error }, "Job failed");
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, async () => {
    logger.info({ signal }, "Shutting down worker");
    await worker.close();
    await prisma.$disconnect();
    connection.disconnect();
    process.exit(0);
  });
}

logger.info({ queue: ORDER_QUEUE_NAME, concurrency: env.WORKER_CONCURRENCY }, "Worker started");
