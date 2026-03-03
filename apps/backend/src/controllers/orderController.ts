import type { Request, Response } from "express";

import { getOwnOrderById, listOwnOrders } from "@/services/orderService";

export async function getOrdersController(req: Request, res: Response): Promise<void> {
  const orders = await listOwnOrders(req.user!.id);
  res.json(orders);
}

export async function getOrderByIdController(req: Request, res: Response): Promise<void> {
  const order = await getOwnOrderById(req.user!.id, req.params.id);
  res.json(order);
}
