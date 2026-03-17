import { Router } from "express";

import { getProduct, getProducts, upsertOwnProductReviewController } from "@/controllers/productController";
import { optionalAuth } from "@/middleware/auth/optionalAuth";
import { requireAuth } from "@/middleware/auth/requireAuth";
import { verifyJwt } from "@/middleware/auth/verifyJwt";
import { validate } from "@/middleware/validate";
import { asyncHandler } from "@/utils/asyncHandler";
import { upsertProductReviewSchema } from "@/validators/reviewValidators";

export const productRoutes: Router = Router();

productRoutes.get("/products", asyncHandler(getProducts));
productRoutes.get("/products/:id", optionalAuth, asyncHandler(getProduct));
productRoutes.put(
  "/products/:id/reviews/me",
  verifyJwt,
  requireAuth,
  validate(upsertProductReviewSchema),
  asyncHandler(upsertOwnProductReviewController),
);
