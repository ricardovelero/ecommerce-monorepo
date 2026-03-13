import type { AdminAnalyticsDTO } from "@ecommerce/shared-types";
import { OrderStatus, FulfillmentStatus } from "@prisma/client";

import { prisma } from "@/db/prisma";

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function createRecentDateRange(days: number): string[] {
  const dates: string[] = [];
  const now = new Date();

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - offset);
    dates.push(toDateKey(date));
  }

  return dates;
}

export async function getAdminAnalytics(): Promise<AdminAnalyticsDTO> {
  const [
    paidOrders,
    allOrders,
    topOrderItems,
    lowStockCount,
    outOfStockCount,
    lowStockProducts,
    totalCustomers,
    customerOrderRows,
  ] = await prisma.$transaction([
    prisma.order.findMany({
      where: { status: OrderStatus.PAID },
      select: {
        id: true,
        totalCents: true,
        createdAt: true,
      },
    }),
    prisma.order.findMany({
      select: {
        status: true,
        fulfillmentStatus: true,
        userId: true,
      },
    }),
    prisma.orderItem.findMany({
      select: {
        productId: true,
        nameSnapshot: true,
        quantity: true,
        priceCentsSnapshot: true,
        order: {
          select: {
            status: true,
          },
        },
      },
    }),
    prisma.product.count({
      where: {
        stock: {
          gt: 0,
          lte: 10,
        },
      },
    }),
    prisma.product.count({
      where: {
        stock: 0,
      },
    }),
    prisma.product.findMany({
      where: {
        stock: {
          lte: 10,
        },
      },
      select: {
        id: true,
        name: true,
        stock: true,
      },
      orderBy: [{ stock: "asc" }, { name: "asc" }],
      take: 5,
    }),
    prisma.user.count(),
    prisma.order.findMany({
      select: {
        userId: true,
      },
    }),
  ]);

  const totalRevenueCents = paidOrders.reduce((sum, order) => sum + order.totalCents, 0);
  const paidOrderCount = paidOrders.length;
  const averageOrderValueCents = paidOrderCount > 0 ? Math.round(totalRevenueCents / paidOrderCount) : 0;

  const orderStatusBreakdown = Object.values(OrderStatus).map((status) => ({
    label: status,
    value: allOrders.filter((order) => order.status === status).length,
  }));

  const fulfillmentBreakdown = Object.values(FulfillmentStatus).map((status) => ({
    label: status,
    value: allOrders.filter((order) => order.fulfillmentStatus === status).length,
  }));

  const revenueDates = createRecentDateRange(7);
  const revenueMap = new Map(
    revenueDates.map((date) => [
      date,
      {
        date,
        revenueCents: 0,
        orders: 0,
      },
    ]),
  );

  for (const order of paidOrders) {
    const key = toDateKey(order.createdAt);
    const current = revenueMap.get(key);
    if (!current) {
      continue;
    }

    current.revenueCents += order.totalCents;
    current.orders += 1;
  }

  const topProductsMap = new Map<string, { productId: string; name: string; unitsSold: number; revenueCents: number }>();
  for (const item of topOrderItems) {
    if (item.order.status !== OrderStatus.PAID) {
      continue;
    }

    const current = topProductsMap.get(item.productId) ?? {
      productId: item.productId,
      name: item.nameSnapshot,
      unitsSold: 0,
      revenueCents: 0,
    };
    current.unitsSold += item.quantity;
    current.revenueCents += item.priceCentsSnapshot * item.quantity;
    topProductsMap.set(item.productId, current);
  }

  const topProducts = [...topProductsMap.values()]
    .sort((left, right) => right.revenueCents - left.revenueCents || right.unitsSold - left.unitsSold)
    .slice(0, 5);

  const customerOrderCounts = new Map<string, number>();
  for (const row of customerOrderRows) {
    customerOrderCounts.set(row.userId, (customerOrderCounts.get(row.userId) ?? 0) + 1);
  }

  const repeatCustomers = [...customerOrderCounts.values()].filter((count) => count > 1).length;

  return {
    revenue: {
      totalRevenueCents,
      paidOrders: paidOrderCount,
      averageOrderValueCents,
    },
    orderStatusBreakdown,
    fulfillmentBreakdown,
    revenueTrend: revenueDates.map((date) => revenueMap.get(date)!),
    topProducts,
    inventoryRisk: {
      lowStockCount,
      outOfStockCount,
      lowStockProducts,
    },
    customers: {
      totalCustomers,
      repeatCustomers,
      firstTimeCustomers: Math.max(totalCustomers - repeatCustomers, 0),
    },
  };
}
