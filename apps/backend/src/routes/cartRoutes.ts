import { Router } from "express";

import {
  addCartItemController,
  getCartController,
  removeCartItemController,
} from "@/controllers/cartController";
import { optionalAuth, requireAuth } from "@/middleware/auth";
import { validate } from "@/middleware/validate";
import { asyncHandler } from "@/utils/asyncHandler";
import { addCartItemSchema } from "@/validators/cartValidators";

export const cartRoutes: Router = Router();

cartRoutes.get("/cart", optionalAuth, asyncHandler(getCartController));
cartRoutes.post(
  "/cart/items",
  requireAuth,
  validate(addCartItemSchema),
  asyncHandler(addCartItemController),
);
cartRoutes.delete("/cart/items/:id", requireAuth, asyncHandler(removeCartItemController));
