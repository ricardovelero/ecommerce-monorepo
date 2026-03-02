import type { Request, Response } from "express";

import {
  createAdminCategory,
  deleteAdminCategory,
  listAdminCategories,
  updateAdminCategory,
} from "@/services/adminCategoryService";

export async function getAdminCategories(_req: Request, res: Response): Promise<void> {
  const categories = await listAdminCategories();
  res.json(categories);
}

export async function postAdminCategory(req: Request, res: Response): Promise<void> {
  const category = await createAdminCategory({
    name: req.body.name,
    actorUserId: req.user!.id,
  });

  res.status(201).json(category);
}

export async function putAdminCategory(req: Request, res: Response): Promise<void> {
  const category = await updateAdminCategory({
    id: req.params.id,
    name: req.body.name,
    actorUserId: req.user!.id,
  });

  res.json(category);
}

export async function deleteAdminCategoryController(req: Request, res: Response): Promise<void> {
  await deleteAdminCategory(req.params.id);
  res.status(204).send();
}
