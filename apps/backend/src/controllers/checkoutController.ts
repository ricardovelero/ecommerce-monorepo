import type { Request, Response } from "express";

import { createCheckoutSession } from "@/services/checkoutService";

export async function createCheckoutSessionController(req: Request, res: Response): Promise<void> {
  const response = await createCheckoutSession({
    userId: req.user!.id,
    email: req.user!.email,
    lang: req.body.lang,
    customerName: req.body.customerName,
    phone: req.body.phone,
    shippingAddressLine1: req.body.shippingAddressLine1,
    shippingAddressLine2: req.body.shippingAddressLine2,
    shippingCity: req.body.shippingCity,
    shippingPostalCode: req.body.shippingPostalCode,
    shippingCountry: req.body.shippingCountry,
    shippingNotes: req.body.shippingNotes,
  });

  res.status(201).json(response);
}
