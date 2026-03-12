import type { ProductListQueryDTO, ProductSort } from "@ecommerce/shared-types";
import type { Request, Response } from "express";

import { getProductById, listProducts } from "@/services/productService";

function parsePositiveInt(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function parseSort(value: unknown): ProductSort {
  if (value === "price_asc" || value === "price_desc" || value === "name_asc") {
    return value;
  }

  return "newest";
}

export async function getProducts(req: Request, res: Response): Promise<void> {
  const query: ProductListQueryDTO = {
    search: typeof req.query.search === "string" ? req.query.search : undefined,
    categoryId: typeof req.query.categoryId === "string" ? req.query.categoryId : undefined,
    sort: parseSort(req.query.sort),
    page: parsePositiveInt(req.query.page, 1),
    pageSize: parsePositiveInt(req.query.pageSize, 9),
  };

  const products = await listProducts(query);
  res.json(products);
}

export async function getProduct(req: Request, res: Response): Promise<void> {
  const product = await getProductById(req.params.id);
  res.json(product);
}
