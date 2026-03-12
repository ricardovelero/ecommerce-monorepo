import { Router } from "express";

import {
  addCartItemController,
  getCartController,
  removeCartItemController,
  updateCartItemQuantityController,
} from "@/controllers/cartController";
import { optionalAuth } from "@/middleware/auth/optionalAuth";
import { requireAuth } from "@/middleware/auth/requireAuth";
import { verifyJwt } from "@/middleware/auth/verifyJwt";
import { validate } from "@/middleware/validate";
import { asyncHandler } from "@/utils/asyncHandler";
import { addCartItemSchema, updateCartItemQuantitySchema } from "@/validators/cartValidators";

export const cartRoutes: Router = Router();

cartRoutes.get("/cart", optionalAuth, asyncHandler(getCartController));
cartRoutes.post(
  "/cart/items",
  verifyJwt,
  requireAuth,
  validate(addCartItemSchema),
  asyncHandler(addCartItemController),
);
cartRoutes.patch(
  "/cart/items/:id",
  verifyJwt,
  requireAuth,
  validate(updateCartItemQuantitySchema),
  asyncHandler(updateCartItemQuantityController),
);
cartRoutes.delete("/cart/items/:id", verifyJwt, requireAuth, asyncHandler(removeCartItemController));
