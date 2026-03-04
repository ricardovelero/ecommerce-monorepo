import { z } from "zod";

export const adminProductSchema = z.object({
  name: z.string().trim().min(1).max(160),
  description: z.string().trim().min(1).max(4000),
  priceCents: z.number().int().min(1),
  stock: z.number().int().min(0).optional(),
  currency: z.string().trim().length(3),
  imageUrl: z.string().trim().url().nullable().optional(),
  categoryId: z.string().trim().min(1),
});
