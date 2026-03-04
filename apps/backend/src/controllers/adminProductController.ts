import type { Request, Response } from "express";

import {
  createAdminProduct,
  deleteAdminProduct,
  listAdminProducts,
  updateAdminProduct,
} from "@/services/adminProductService";

export async function getAdminProducts(_req: Request, res: Response): Promise<void> {
  const products = await listAdminProducts();
  res.json(products);
}

export async function postAdminProduct(req: Request, res: Response): Promise<void> {
  const product = await createAdminProduct({
    name: req.body.name,
    description: req.body.description,
    priceCents: req.body.priceCents,
    stock: req.body.stock,
    currency: req.body.currency,
    imageUrl: req.body.imageUrl,
    categoryId: req.body.categoryId,
    actorUserId: req.user!.id,
  });

  res.status(201).json(product);
}

export async function putAdminProduct(req: Request, res: Response): Promise<void> {
  const product = await updateAdminProduct({
    id: req.params.id,
    name: req.body.name,
    description: req.body.description,
    priceCents: req.body.priceCents,
    stock: req.body.stock,
    currency: req.body.currency,
    imageUrl: req.body.imageUrl,
    categoryId: req.body.categoryId,
    actorUserId: req.user!.id,
  });

  res.json(product);
}

export async function deleteAdminProductController(req: Request, res: Response): Promise<void> {
  await deleteAdminProduct(req.params.id);
  res.status(204).send();
}
