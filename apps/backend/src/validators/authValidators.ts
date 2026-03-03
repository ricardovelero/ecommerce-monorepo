import { z } from "zod";

export const updateMeEmailSchema = z.object({
  email: z
    .string()
    .transform((value) => value.trim().toLowerCase())
    .pipe(z.string().email()),
});
