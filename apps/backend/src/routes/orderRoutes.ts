import { Router } from "express";

import { getOrderByIdController, getOrdersController } from "@/controllers/orderController";
import { requireAuth } from "@/middleware/auth/requireAuth";
import { verifyJwt } from "@/middleware/auth/verifyJwt";
import { asyncHandler } from "@/utils/asyncHandler";

export const orderRoutes: Router = Router();

orderRoutes.get("/orders", verifyJwt, requireAuth, asyncHandler(getOrdersController));
orderRoutes.get("/orders/:id", verifyJwt, requireAuth, asyncHandler(getOrderByIdController));
