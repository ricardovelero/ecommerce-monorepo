import assert from "node:assert/strict";
import test from "node:test";

import { createEmailService } from "@/services/emailService";

test("sendOrderFulfillmentEmail skips safely when Postmark is not configured", async () => {
  const logs: Array<{ payload: object; message: string }> = [];
  const emailService = createEmailService({
    postmarkClient: null,
    fromEmail: null,
    loggerInstance: {
      info(payload, message) {
        logs.push({ payload, message });
      },
    },
  });

  await assert.doesNotReject(() =>
    emailService.sendOrderFulfillmentEmail({
      to: "customer@example.com",
      orderId: "order_1234567890",
      fulfillmentStatus: "SHIPPED",
      trackingNumber: "TRACK-123",
      trackingUrl: "https://tracking.example.com/TRACK-123",
    }),
  );

  assert.deepEqual(logs, [
    {
      payload: {
        userEmail: "customer@example.com",
        orderId: "order_1234567890",
      },
      message: "Skipping order fulfillment email: Postmark not configured",
    },
  ]);
});
