import { z } from "zod";

export const createCheckoutSessionSchema = z.object({
  lang: z.enum(["es", "en"]).optional(),
  customerName: z.string().trim().min(1).max(160),
  phone: z.string().trim().max(40).optional().nullable(),
  shippingAddressLine1: z.string().trim().min(1).max(200),
  shippingAddressLine2: z.string().trim().max(200).optional().nullable(),
  shippingCity: z.string().trim().min(1).max(120),
  shippingPostalCode: z.string().trim().min(1).max(40),
  shippingCountry: z.string().trim().min(2).max(80),
  shippingNotes: z.string().trim().max(500).optional().nullable(),
});
