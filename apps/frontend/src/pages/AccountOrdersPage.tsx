import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuthClient } from "@/features/auth/hooks/useAuthClient";
import { useOrders } from "@/features/orders/useOrders";
import { formatPrice } from "@/lib/utils";

export function AccountOrdersPage() {
  const authClient = useAuthClient();
  const { orders, loading } = useOrders();
  const { lang } = useParams();
  const locale = lang === "en" ? "en-US" : "es-ES";
  const prefix = `/${lang ?? "es"}`;

  useEffect(() => {
    if (!authClient.isAuthenticated()) {
      void authClient.signIn();
    }
  }, [authClient]);

  if (!authClient.isAuthenticated()) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order history</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id.slice(0, 12)}</TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell>{formatPrice(order.totalCents, order.currency, locale)}</TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleString(locale)}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="outline">
                      <Link to={`${prefix}/account/orders/${order.id}`}>Detail</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
