import { Router } from "express";

import {
  createCheckoutSessionController,
  getCheckoutSessionStatusController,
  reconcileCheckoutSessionController,
} from "@/controllers/checkoutController";
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
checkoutRoutes.get(
  "/checkout/session/:id/status",
  verifyJwt,
  requireAuth,
  asyncHandler(getCheckoutSessionStatusController),
);
checkoutRoutes.post(
  "/checkout/session/:id/reconcile",
  verifyJwt,
  requireAuth,
  asyncHandler(reconcileCheckoutSessionController),
);
