import { Queue, type ConnectionOptions, type JobsOptions } from "bullmq";
import IORedis from "ioredis";

export const ORDER_QUEUE_NAME = "order-processing";

export interface StripeWebhookJobData {
  stripeEventId: string;
  stripeEventType: string;
  stripeObjectId: string;
}

export function createRedisConnection(redisUrl: string): IORedis {
  return new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
  });
}

export function getStripeWebhookJobId(eventId: string): string {
  return `stripe-event-${eventId}`;
}

export function createOrderQueue(
  connection: ConnectionOptions,
  options?: { defaultJobOptions?: JobsOptions },
): Queue<StripeWebhookJobData, void, "stripe.webhook"> {
  return new Queue<StripeWebhookJobData, void, "stripe.webhook">(ORDER_QUEUE_NAME, {
    connection,
    defaultJobOptions: {
      attempts: 5,
      backoff: {
        type: "exponential",
        delay: 3000,
      },
      removeOnComplete: {
        age: 60 * 60 * 24,
      },
      removeOnFail: {
        age: 60 * 60 * 24 * 7,
      },
      ...options?.defaultJobOptions,
    },
  });
}
