import type { Request, Response } from "express";

import { getAdminOrderById, listAdminOrders, updateAdminOrderFulfillment } from "@/services/orderService";

export async function getAdminOrdersController(_req: Request, res: Response): Promise<void> {
  const orders = await listAdminOrders();
  res.json(orders);
}

export async function getAdminOrderByIdController(req: Request, res: Response): Promise<void> {
  const order = await getAdminOrderById(req.params.id);
  res.json(order);
}

export async function patchAdminOrderFulfillmentController(req: Request, res: Response): Promise<void> {
  const order = await updateAdminOrderFulfillment({
    orderId: req.params.id,
    fulfillmentStatus: req.body.fulfillmentStatus,
    trackingNumber: req.body.trackingNumber,
  });
  res.json(order);
}
