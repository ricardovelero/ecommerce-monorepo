import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuthClient } from "@/features/auth/hooks/useAuthClient";
import { useOrder } from "@/features/orders/useOrders";
import { formatPrice } from "@/lib/utils";

export function AccountOrderDetailPage() {
  const { lang, id } = useParams();
  const authClient = useAuthClient();
  const { order, loading } = useOrder(id);
  const prefix = `/${lang ?? "es"}`;
  const locale = lang === "en" ? "en-US" : "es-ES";

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
        <CardTitle>Order detail</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button asChild size="sm" variant="outline">
          <Link to={`${prefix}/account/orders`}>Back to orders</Link>
        </Button>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading order...</p>
        ) : !order ? (
          <p className="text-sm text-muted-foreground">Order not found.</p>
        ) : (
          <>
            <div className="grid gap-2 text-sm">
              <p>Order ID: {order.id}</p>
              <p>Status: {order.status}</p>
              <p>Total: {formatPrice(order.totalCents, order.currency, locale)}</p>
              <p>Created: {new Date(order.createdAt).toLocaleString(locale)}</p>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit price</TableHead>
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
          </>
        )}
      </CardContent>
    </Card>
  );
}
