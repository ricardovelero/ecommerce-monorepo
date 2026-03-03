import { Router } from "express";

import { getMeController, updateMeEmailController } from "@/controllers/authController";
import { requireAuth } from "@/middleware/auth/requireAuth";
import { validate } from "@/middleware/validate";
import { verifyJwt } from "@/middleware/auth/verifyJwt";
import { asyncHandler } from "@/utils/asyncHandler";
import { updateMeEmailSchema } from "@/validators/authValidators";

export const authRoutes: Router = Router();

authRoutes.get("/me", verifyJwt, requireAuth, asyncHandler(getMeController));
authRoutes.patch(
  "/me/email",
  verifyJwt,
  requireAuth,
  validate(updateMeEmailSchema),
  asyncHandler(updateMeEmailController),
);
