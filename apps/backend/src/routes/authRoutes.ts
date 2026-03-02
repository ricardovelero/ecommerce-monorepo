import { Router } from "express";

import { getMeController } from "@/controllers/authController";
import { requireAuth } from "@/middleware/auth/requireAuth";
import { verifyJwt } from "@/middleware/auth/verifyJwt";
import { asyncHandler } from "@/utils/asyncHandler";

export const authRoutes: Router = Router();

authRoutes.get("/me", verifyJwt, requireAuth, asyncHandler(getMeController));
