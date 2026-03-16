import assert from "node:assert/strict";
import test from "node:test";

import { createAdminOrderFulfillmentService } from "@/services/orderService";

function createOrder(overrides: Partial<{
  fulfillmentStatus: "UNFULFILLED" | "PROCESSING" | "SHIPPED" | "DELIVERED";
  shippingCarrier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  fulfilledAt: Date | null;
  userEmail: string | null;
}> = {}) {
  const now = new Date("2026-03-16T09:30:00.000Z");

  return {
    id: "order_1234567890",
    userId: "user_123",
    status: "PAID" as const,
    fulfillmentStatus: overrides.fulfillmentStatus ?? "UNFULFILLED",
    currency: "EUR",
    subtotalCents: 1099,
    totalCents: 1099,
    customerName: "Jane Doe",
    phone: null,
    shippingAddressLine1: "Main Street 1",
    shippingAddressLine2: null,
    shippingCity: "Madrid",
    shippingPostalCode: "28001",
    shippingCountry: "ES",
    shippingNotes: null,
    shippingCarrier: overrides.shippingCarrier ?? null,
    trackingNumber: overrides.trackingNumber ?? null,
    trackingUrl: overrides.trackingUrl ?? null,
    fulfilledAt: overrides.fulfilledAt ?? null,
    stripeCheckoutSessionId: "cs_test_123",
    stripePaymentIntentId: "pi_test_123",
    stripeCustomerId: "cus_test_123",
    paidAt: now,
    createdAt: now,
    updatedAt: now,
    items: [],
    user: {
      email: "userEmail" in overrides ? overrides.userEmail ?? null : "customer@example.com",
    },
  };
}

test("updateAdminOrderFulfillment sends an email when the fulfillment status changes", async () => {
  const existing = createOrder();
  const updated = {
    ...existing,
    fulfillmentStatus: "PROCESSING" as const,
    user: undefined,
  };
  const sendCalls: Array<{
    to: string;
    orderId: string;
    fulfillmentStatus: string;
    trackingNumber: string | null;
    trackingUrl: string | null;
  }> = [];

  const service = createAdminOrderFulfillmentService({
    prismaClient: {
      order: {
        async findUnique() {
          return existing;
        },
        async update() {
          return updated;
        },
      },
    },
    sendOrderFulfillmentEmailFn: async (input) => {
      sendCalls.push(input);
    },
    loggerInstance: {
      info() {},
      error() {},
    },
  });

  await service.updateAdminOrderFulfillment({
    orderId: existing.id,
    fulfillmentStatus: "PROCESSING",
  });

  assert.deepEqual(sendCalls, [
    {
      to: "customer@example.com",
      orderId: "order_1234567890",
      fulfillmentStatus: "PROCESSING",
      trackingNumber: null,
      trackingUrl: null,
    },
  ]);
});

test("updateAdminOrderFulfillment sends an email when tracking info is added", async () => {
  const existing = createOrder({
    fulfillmentStatus: "SHIPPED",
  });
  const updated = {
    ...existing,
    shippingCarrier: "Correos",
    trackingNumber: "TRACK-123",
    trackingUrl: "https://tracking.example.com/TRACK-123",
    user: undefined,
  };
  const sendCalls: Array<{
    trackingNumber: string | null;
    trackingUrl: string | null;
  }> = [];

  const service = createAdminOrderFulfillmentService({
    prismaClient: {
      order: {
        async findUnique() {
          return existing;
        },
        async update() {
          return updated;
        },
      },
    },
    sendOrderFulfillmentEmailFn: async (input) => {
      sendCalls.push({
        trackingNumber: input.trackingNumber,
        trackingUrl: input.trackingUrl,
      });
    },
    loggerInstance: {
      info() {},
      error() {},
    },
  });

  await service.updateAdminOrderFulfillment({
    orderId: existing.id,
    fulfillmentStatus: "SHIPPED",
    shippingCarrier: "Correos",
    trackingNumber: "TRACK-123",
    trackingUrl: "https://tracking.example.com/TRACK-123",
  });

  assert.deepEqual(sendCalls, [
    {
      trackingNumber: "TRACK-123",
      trackingUrl: "https://tracking.example.com/TRACK-123",
    },
  ]);
});

test("updateAdminOrderFulfillment does not send an email for a no-op update", async () => {
  const existing = createOrder({
    fulfillmentStatus: "SHIPPED",
    shippingCarrier: "Correos",
    trackingNumber: "TRACK-123",
    trackingUrl: "https://tracking.example.com/TRACK-123",
  });
  const updated = {
    ...existing,
    user: undefined,
  };
  const sendCalls: Array<object> = [];
  const logs: string[] = [];

  const service = createAdminOrderFulfillmentService({
    prismaClient: {
      order: {
        async findUnique() {
          return existing;
        },
        async update() {
          return updated;
        },
      },
    },
    sendOrderFulfillmentEmailFn: async (input) => {
      sendCalls.push(input);
    },
    loggerInstance: {
      info(_payload, message) {
        logs.push(message);
      },
      error() {},
    },
  });

  await service.updateAdminOrderFulfillment({
    orderId: existing.id,
    fulfillmentStatus: "SHIPPED",
    shippingCarrier: " Correos ",
    trackingNumber: " TRACK-123 ",
    trackingUrl: "https://tracking.example.com/TRACK-123",
  });

  assert.equal(sendCalls.length, 0);
  assert.deepEqual(logs, ["Skipping fulfillment email: no meaningful changes"]);
});

test("updateAdminOrderFulfillment skips the email safely when the customer email is missing", async () => {
  const existing = createOrder({
    userEmail: null,
  });
  const updated = {
    ...existing,
    fulfillmentStatus: "PROCESSING" as const,
    user: undefined,
  };
  const sendCalls: Array<object> = [];
  const logs: string[] = [];

  const service = createAdminOrderFulfillmentService({
    prismaClient: {
      order: {
        async findUnique() {
          return existing;
        },
        async update() {
          return updated;
        },
      },
    },
    sendOrderFulfillmentEmailFn: async (input) => {
      sendCalls.push(input);
    },
    loggerInstance: {
      info(_payload, message) {
        logs.push(message);
      },
      error() {},
    },
  });

  await service.updateAdminOrderFulfillment({
    orderId: existing.id,
    fulfillmentStatus: "PROCESSING",
  });

  assert.equal(sendCalls.length, 0);
  assert.deepEqual(logs, ["Skipping fulfillment email: customer email missing"]);
});
