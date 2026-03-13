import { z } from "zod";

export const adminOrderFulfillmentSchema = z.object({
  fulfillmentStatus: z.enum(["UNFULFILLED", "PROCESSING", "SHIPPED", "DELIVERED"]),
  trackingNumber: z.string().trim().max(120).optional().nullable(),
});
