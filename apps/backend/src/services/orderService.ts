import type { FulfillmentStatus, OrderStatus } from "@prisma/client";

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
  fulfillmentStatus: FulfillmentStatus;
  currency: string;
  subtotalCents: number;
  totalCents: number;
  customerName: string | null;
  phone: string | null;
  shippingAddressLine1: string | null;
  shippingAddressLine2: string | null;
  shippingCity: string | null;
  shippingPostalCode: string | null;
  shippingCountry: string | null;
  shippingNotes: string | null;
  shippingCarrier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  fulfilledAt: Date | null;
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
  fulfillmentStatus: FulfillmentStatus;
  currency: string;
  subtotalCents: number;
  totalCents: number;
  customerName: string | null;
  phone: string | null;
  shippingAddressLine1: string | null;
  shippingAddressLine2: string | null;
  shippingCity: string | null;
  shippingPostalCode: string | null;
  shippingCountry: string | null;
  shippingNotes: string | null;
  shippingCarrier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  fulfilledAt: Date | null;
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
    fulfillmentStatus: order.fulfillmentStatus,
    currency: order.currency,
    subtotalCents: order.subtotalCents,
    totalCents: order.totalCents,
    customerName: order.customerName,
    phone: order.phone,
    shippingAddressLine1: order.shippingAddressLine1,
    shippingAddressLine2: order.shippingAddressLine2,
    shippingCity: order.shippingCity,
    shippingPostalCode: order.shippingPostalCode,
    shippingCountry: order.shippingCountry,
    shippingNotes: order.shippingNotes,
    shippingCarrier: order.shippingCarrier,
    trackingNumber: order.trackingNumber,
    trackingUrl: order.trackingUrl,
    fulfilledAt: order.fulfilledAt,
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

export async function updateAdminOrderFulfillment(input: {
  orderId: string;
  fulfillmentStatus: FulfillmentStatus;
  shippingCarrier?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  fulfilledAt?: Date | null;
}): Promise<OrderDTO> {
  const existing = await prisma.order.findUnique({
    where: { id: input.orderId },
    include: { items: true },
  });

  if (!existing) {
    throw new HttpError(404, "Order not found");
  }

  const order = await prisma.order.update({
    where: { id: input.orderId },
    data: {
      fulfillmentStatus: input.fulfillmentStatus,
      shippingCarrier: input.shippingCarrier?.trim() ? input.shippingCarrier.trim() : null,
      trackingNumber: input.trackingNumber?.trim() ? input.trackingNumber.trim() : null,
      trackingUrl: input.trackingUrl?.trim() ? input.trackingUrl.trim() : null,
      fulfilledAt:
        input.fulfillmentStatus === "DELIVERED"
          ? input.fulfilledAt ?? existing.fulfilledAt ?? new Date()
          : null,
    },
    include: { items: true },
  });

  return toOrderDTO(order);
}
