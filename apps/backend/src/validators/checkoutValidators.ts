import { z } from "zod";

export const createCheckoutSessionSchema = z.object({
  lang: z.enum(["es", "en"]).optional(),
});
