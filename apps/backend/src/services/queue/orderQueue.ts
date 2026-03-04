import { createOrderQueue, getStripeWebhookJobId, type StripeWebhookJobData } from "@ecommerce/queue";

import { redisConnection } from "@/redis/connection";

const orderQueue = createOrderQueue(redisConnection);

export async function enqueueStripeWebhookJob(data: StripeWebhookJobData): Promise<void> {
  await orderQueue.add("stripe.webhook", data, {
    jobId: getStripeWebhookJobId(data.stripeEventId),
  });
}
