import { Router } from "express";

import { createCheckoutSessionController } from "@/controllers/checkoutController";
import { requireAuth } from "@/middleware/auth/requireAuth";
import { verifyJwt } from "@/middleware/auth/verifyJwt";
import { validate } from "@/middleware/validate";
import { asyncHandler } from "@/utils/asyncHandler";
import { createCheckoutSessionSchema } from "@/validators/checkoutValidators";

export const checkoutRoutes: Router = Router();

checkoutRoutes.post(
  "/checkout/session",
  verifyJwt,
  requireAuth,
  validate(createCheckoutSessionSchema),
  asyncHandler(createCheckoutSessionController),
);
