import type { Request, Response } from "express";

import { getProductById, listProducts } from "@/services/productService";

export async function getProducts(_req: Request, res: Response): Promise<void> {
  const products = await listProducts();
  res.json(products);
}

export async function getProduct(req: Request, res: Response): Promise<void> {
  const product = await getProductById(req.params.id);
  res.json(product);
}
