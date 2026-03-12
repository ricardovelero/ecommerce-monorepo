import { z } from "zod";

export const addCartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(50),
});

export const updateCartItemQuantitySchema = z.object({
  quantity: z.number().int().min(0).max(50),
});
