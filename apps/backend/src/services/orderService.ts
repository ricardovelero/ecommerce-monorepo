import type { FulfillmentStatus, OrderStatus } from "@prisma/client";

import { prisma } from "@/db/prisma";
import { logger } from "@/lib/logger";
import { sendOrderFulfillmentEmail } from "@/services/emailService";
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

type OrderRecord = {
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
};

type OrderRecordWithUser = OrderRecord & {
  user: {
    email: string | null;
  };
};

type FulfillmentLogger = {
  info: (payload: object, message: string) => void;
  error: (payload: object, message: string) => void;
};

function toOrderDTO(order: OrderRecord): OrderDTO {
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

function normalizeNullableString(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized || null;
}

function normalizeEmail(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  return normalized || null;
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

export function createAdminOrderFulfillmentService(deps: {
  prismaClient: {
    order: {
      findUnique: (args: {
        where: { id: string };
        include: { items: true; user: { select: { email: true } } };
      }) => Promise<OrderRecordWithUser | null>;
      update: (args: {
        where: { id: string };
        data: {
          fulfillmentStatus: FulfillmentStatus;
          shippingCarrier: string | null;
          trackingNumber: string | null;
          trackingUrl: string | null;
          fulfilledAt: Date | null;
        };
        include: { items: true };
      }) => Promise<OrderRecord>;
    };
  };
  sendOrderFulfillmentEmailFn: typeof sendOrderFulfillmentEmail;
  loggerInstance: FulfillmentLogger;
} = {
  prismaClient: prisma,
  sendOrderFulfillmentEmailFn: sendOrderFulfillmentEmail,
  loggerInstance: logger,
}) {
  return {
    async updateAdminOrderFulfillment(input: {
      orderId: string;
      fulfillmentStatus: FulfillmentStatus;
      shippingCarrier?: string | null;
      trackingNumber?: string | null;
      trackingUrl?: string | null;
      fulfilledAt?: Date | null;
    }): Promise<OrderDTO> {
      const existing = await deps.prismaClient.order.findUnique({
        where: { id: input.orderId },
        include: {
          items: true,
          user: {
            select: {
              email: true,
            },
          },
        },
      });

      if (!existing) {
        throw new HttpError(404, "Order not found");
      }

      const nextShippingCarrier = normalizeNullableString(input.shippingCarrier);
      const nextTrackingNumber = normalizeNullableString(input.trackingNumber);
      const nextTrackingUrl = normalizeNullableString(input.trackingUrl);
      const nextFulfilledAt =
        input.fulfillmentStatus === "DELIVERED" ? input.fulfilledAt ?? existing.fulfilledAt ?? new Date() : null;
      const shouldSendFulfillmentEmail =
        existing.fulfillmentStatus !== input.fulfillmentStatus ||
        normalizeNullableString(existing.trackingNumber) !== nextTrackingNumber ||
        normalizeNullableString(existing.trackingUrl) !== nextTrackingUrl;

      const order = await deps.prismaClient.order.update({
        where: { id: input.orderId },
        data: {
          fulfillmentStatus: input.fulfillmentStatus,
          shippingCarrier: nextShippingCarrier,
          trackingNumber: nextTrackingNumber,
          trackingUrl: nextTrackingUrl,
          fulfilledAt: nextFulfilledAt,
        },
        include: { items: true },
      });

      if (!shouldSendFulfillmentEmail) {
        deps.loggerInstance.info({ orderId: input.orderId }, "Skipping fulfillment email: no meaningful changes");
        return toOrderDTO(order);
      }

      const customerEmail = normalizeEmail(existing.user.email);

      if (!customerEmail) {
        deps.loggerInstance.info({ orderId: input.orderId }, "Skipping fulfillment email: customer email missing");
        return toOrderDTO(order);
      }

      try {
        await deps.sendOrderFulfillmentEmailFn({
          to: customerEmail,
          orderId: order.id,
          fulfillmentStatus: order.fulfillmentStatus,
          trackingNumber: order.trackingNumber,
          trackingUrl: order.trackingUrl,
        });

        deps.loggerInstance.info(
          {
            orderId: order.id,
            userEmail: customerEmail,
            fulfillmentStatus: order.fulfillmentStatus,
          },
          "Sent fulfillment email",
        );
      } catch (error) {
        deps.loggerInstance.error({ orderId: order.id, error }, "Failed to send fulfillment email");
      }

      return toOrderDTO(order);
    },
  };
}

const adminOrderFulfillmentService = createAdminOrderFulfillmentService();

export async function updateAdminOrderFulfillment(input: {
  orderId: string;
  fulfillmentStatus: FulfillmentStatus;
  shippingCarrier?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  fulfilledAt?: Date | null;
}): Promise<OrderDTO> {
  return adminOrderFulfillmentService.updateAdminOrderFulfillment(input);
}
