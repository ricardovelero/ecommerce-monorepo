import type { Request, Response } from "express";

import { getAdminAnalytics } from "@/services/adminAnalyticsService";
import { getAdminOrderById, listAdminOrders, updateAdminOrderFulfillment } from "@/services/orderService";

export async function getAdminAnalyticsController(_req: Request, res: Response): Promise<void> {
  const analytics = await getAdminAnalytics();
  res.json(analytics);
}

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
    shippingCarrier: req.body.shippingCarrier,
    trackingNumber: req.body.trackingNumber,
    trackingUrl: req.body.trackingUrl,
    fulfilledAt: req.body.fulfilledAt ? new Date(req.body.fulfilledAt) : null,
  });
  res.json(order);
}
