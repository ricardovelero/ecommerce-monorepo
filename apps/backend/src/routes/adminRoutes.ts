import { Role } from "@prisma/client";
import { Router } from "express";

import {
  deleteAdminCategoryController,
  getAdminCategories,
  postAdminCategory,
  putAdminCategory,
} from "@/controllers/adminCategoryController";
import {
  deleteAdminProductController,
  getAdminProducts,
  postAdminProduct,
  putAdminProduct,
} from "@/controllers/adminProductController";
import { requireAuth } from "@/middleware/auth/requireAuth";
import { requireRole } from "@/middleware/auth/requireRole";
import { verifyJwt } from "@/middleware/auth/verifyJwt";
import { validate } from "@/middleware/validate";
import { asyncHandler } from "@/utils/asyncHandler";
import { adminCategorySchema } from "@/validators/adminCategoryValidators";
import { adminProductSchema } from "@/validators/adminProductValidators";

export const adminRoutes: Router = Router();

adminRoutes.use(verifyJwt, requireAuth, requireRole(Role.ADMIN));

adminRoutes.get("/admin/products", asyncHandler(getAdminProducts));
adminRoutes.post(
  "/admin/products",
  validate(adminProductSchema),
  asyncHandler(postAdminProduct),
);
adminRoutes.put(
  "/admin/products/:id",
  validate(adminProductSchema),
  asyncHandler(putAdminProduct),
);
adminRoutes.delete("/admin/products/:id", asyncHandler(deleteAdminProductController));

adminRoutes.get("/admin/categories", asyncHandler(getAdminCategories));
adminRoutes.post(
  "/admin/categories",
  validate(adminCategorySchema),
  asyncHandler(postAdminCategory),
);
adminRoutes.put(
  "/admin/categories/:id",
  validate(adminCategorySchema),
  asyncHandler(putAdminCategory),
);
adminRoutes.delete("/admin/categories/:id", asyncHandler(deleteAdminCategoryController));
