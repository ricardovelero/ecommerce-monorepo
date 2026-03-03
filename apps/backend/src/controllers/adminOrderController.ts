import type { Request, Response } from "express";

import { getAdminOrderById, listAdminOrders } from "@/services/orderService";

export async function getAdminOrdersController(_req: Request, res: Response): Promise<void> {
  const orders = await listAdminOrders();
  res.json(orders);
}

export async function getAdminOrderByIdController(req: Request, res: Response): Promise<void> {
  const order = await getAdminOrderById(req.params.id);
  res.json(order);
}
