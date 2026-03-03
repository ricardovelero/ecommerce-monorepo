import type { OrderStatus } from "@prisma/client";

import { prisma } from "@/db/prisma";
import { HttpError } from "@/utils/httpError";

interface OrderItemDTO {
  id: string;
  productId: string;
  nameSnapshot: string;
  priceCentsSnapshot: number;
  quantity: number;
}

export interface OrderDTO {
  id: string;
  userId: string;
  status: OrderStatus;
  currency: string;
  subtotalCents: number;
  totalCents: number;
  stripeCheckoutSessionId: string | null;
  stripePaymentIntentId: string | null;
  stripeCustomerId: string | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItemDTO[];
}

function toOrderDTO(order: {
  id: string;
  userId: string;
  status: OrderStatus;
  currency: string;
  subtotalCents: number;
  totalCents: number;
  stripeCheckoutSessionId: string | null;
  stripePaymentIntentId: string | null;
  stripeCustomerId: string | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  items: Array<{
    id: string;
    productId: string;
    nameSnapshot: string;
    priceCentsSnapshot: number;
    quantity: number;
  }>;
}): OrderDTO {
  return {
    id: order.id,
    userId: order.userId,
    status: order.status,
    currency: order.currency,
    subtotalCents: order.subtotalCents,
    totalCents: order.totalCents,
    stripeCheckoutSessionId: order.stripeCheckoutSessionId,
    stripePaymentIntentId: order.stripePaymentIntentId,
    stripeCustomerId: order.stripeCustomerId,
    paidAt: order.paidAt,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      nameSnapshot: item.nameSnapshot,
      priceCentsSnapshot: item.priceCentsSnapshot,
      quantity: item.quantity,
    })),
  };
}

export async function listOwnOrders(userId: string): Promise<OrderDTO[]> {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return orders.map(toOrderDTO);
}

export async function getOwnOrderById(userId: string, orderId: string): Promise<OrderDTO> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
    },
  });

  if (!order || order.userId !== userId) {
    throw new HttpError(404, "Order not found");
  }

  return toOrderDTO(order);
}

export async function listAdminOrders(): Promise<OrderDTO[]> {
  const orders = await prisma.order.findMany({
    include: {
      items: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return orders.map(toOrderDTO);
}

export async function getAdminOrderById(orderId: string): Promise<OrderDTO> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
    },
  });

  if (!order) {
    throw new HttpError(404, "Order not found");
  }

  return toOrderDTO(order);
}
