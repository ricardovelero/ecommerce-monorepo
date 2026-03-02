import { Router } from "express";

import { getProduct, getProducts } from "@/controllers/productController";
import { asyncHandler } from "@/utils/asyncHandler";

export const productRoutes: Router = Router();

productRoutes.get("/products", asyncHandler(getProducts));
productRoutes.get("/products/:id", asyncHandler(getProduct));
