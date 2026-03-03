import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminNav } from "@/features/admin/AdminNav";
import type { Order } from "@/features/orders/types";
import { useHttpClient } from "@/features/shared/api/useHttpClient";
import { formatPrice } from "@/lib/utils";

export function AdminOrderDetailPage() {
  const http = useHttpClient();
  const { id, lang } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const prefix = `/${lang ?? "es"}/admin`;
  const locale = lang === "en" ? "en-US" : "es-ES";

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    http
      .get<Order>(`/api/admin/orders/${id}`)
      .then(setOrder)
      .finally(() => setLoading(false));
  }, [http, id]);

  return (
    <section className="space-y-4">
      <AdminNav />
      <Button asChild size="sm" variant="outline">
        <Link to={`${prefix}/orders`}>Back to orders</Link>
      </Button>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading order...</p>
      ) : !order ? (
        <p className="text-sm text-muted-foreground">Order not found.</p>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Order {order.id}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 text-sm">
              <p>Status: {order.status}</p>
              <p>Total: {formatPrice(order.totalCents, order.currency, locale)}</p>
              <p>Stripe session: {order.stripeCheckoutSessionId ?? "-"}</p>
              <p>Stripe payment intent: {order.stripePaymentIntentId ?? "-"}</p>
              <p>Stripe customer: {order.stripeCustomerId ?? "-"}</p>
              <p>Paid at: {order.paidAt ? new Date(order.paidAt).toLocaleString(locale) : "-"}</p>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.nameSnapshot}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{formatPrice(item.priceCentsSnapshot, order.currency, locale)}</TableCell>
                    <TableCell>
                      {formatPrice(item.priceCentsSnapshot * item.quantity, order.currency, locale)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
