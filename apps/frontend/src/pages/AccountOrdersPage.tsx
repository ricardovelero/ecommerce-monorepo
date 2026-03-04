import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

import { ErrorState } from "@/components/ErrorState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuthClient } from "@/features/auth/hooks/useAuthClient";
import { useOrders } from "@/features/orders/hooks/useOrders";
import { formatPrice } from "@/lib/utils";

export function AccountOrdersPage() {
  const authClient = useAuthClient();
  const { data: orders = [], isLoading, isError, refetch } = useOrders();
  const { t } = useTranslation();
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
        <CardTitle>{t("account.orderHistoryTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <TableSkeleton />
        ) : isError ? (
          <ErrorState
            title={t("errors.generic")}
            description={t("account.loadingOrders")}
            actionLabel={t("errors.retry")}
            onAction={() => void refetch()}
          />
        ) : orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("account.noOrders")}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("account.columns.order")}</TableHead>
                <TableHead>{t("account.columns.status")}</TableHead>
                <TableHead>{t("account.columns.total")}</TableHead>
                <TableHead>{t("account.columns.date")}</TableHead>
                <TableHead className="text-right">{t("account.columns.action")}</TableHead>
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
                      <Link to={`${prefix}/account/orders/${order.id}`}>{t("common.detail")}</Link>
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

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  );
}
