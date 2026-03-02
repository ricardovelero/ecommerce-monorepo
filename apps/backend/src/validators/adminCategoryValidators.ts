import { z } from "zod";

export const adminCategorySchema = z.object({
  name: z.string().trim().min(1).max(120),
});
