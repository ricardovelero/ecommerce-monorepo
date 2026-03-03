import type { Request, Response } from "express";

import { createCheckoutSession } from "@/services/checkoutService";

export async function createCheckoutSessionController(req: Request, res: Response): Promise<void> {
  const response = await createCheckoutSession({
    userId: req.user!.id,
    email: req.user!.email,
    lang: req.body.lang,
  });

  res.status(201).json(response);
}
