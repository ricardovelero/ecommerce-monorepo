import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminNav } from "@/features/admin/AdminNav";
import type { Order } from "@/features/orders/types";
import { useHttpClient } from "@/features/shared/api/useHttpClient";
import { formatPrice } from "@/lib/utils";

export function AdminOrdersPage() {
  const http = useHttpClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { lang } = useParams();
  const locale = lang === "en" ? "en-US" : "es-ES";
  const prefix = `/${lang ?? "es"}/admin`;

  useEffect(() => {
    http
      .get<Order[]>("/api/admin/orders")
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [http]);

  return (
    <section className="space-y-4">
      <AdminNav />
      <h1 className="text-2xl font-semibold">Admin Orders</h1>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading orders...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Paid at</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id.slice(0, 12)}</TableCell>
                <TableCell>{order.userId.slice(0, 10)}</TableCell>
                <TableCell>{order.status}</TableCell>
                <TableCell>{formatPrice(order.totalCents, order.currency, locale)}</TableCell>
                <TableCell>{order.paidAt ? new Date(order.paidAt).toLocaleString(locale) : "-"}</TableCell>
                <TableCell className="text-right">
                  <Button asChild size="sm" variant="outline">
                    <Link to={`${prefix}/orders/${order.id}`}>Detail</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </section>
  );
}
