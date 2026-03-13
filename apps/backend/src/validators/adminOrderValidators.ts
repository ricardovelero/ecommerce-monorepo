import { z } from "zod";

export const adminOrderFulfillmentSchema = z.object({
  fulfillmentStatus: z.enum(["UNFULFILLED", "PROCESSING", "SHIPPED", "DELIVERED"]),
  shippingCarrier: z.string().trim().max(120).optional().nullable(),
  trackingNumber: z.string().trim().max(120).optional().nullable(),
  trackingUrl: z.string().trim().url().max(500).optional().nullable(),
  fulfilledAt: z.string().datetime().optional().nullable(),
});
