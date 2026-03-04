import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

import { ErrorState } from "@/components/ErrorState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminNav } from "@/features/admin/AdminNav";
import { useAdminOrder } from "@/features/admin/hooks/useAdminOrders";
import { formatPrice } from "@/lib/utils";

export function AdminOrderDetailPage() {
  const { t } = useTranslation();
  const { id, lang } = useParams();
  const { data: order, isLoading, isError, refetch } = useAdminOrder(id);
  const prefix = `/${lang ?? "es"}/admin`;
  const locale = lang === "en" ? "en-US" : "es-ES";

  return (
    <section className="space-y-4">
      <AdminNav />
      <Button asChild size="sm" variant="outline">
        <Link to={`${prefix}/orders`}>{t("admin.orders.back")}</Link>
      </Button>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : isError ? (
        <ErrorState
          title={t("errors.adminOrderTitle")}
          description={t("errors.adminOrderDescription")}
          actionLabel={t("errors.retry")}
          onAction={() => void refetch()}
        />
      ) : !order ? (
        <p className="text-sm text-muted-foreground">{t("errors.notFound")}</p>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t("admin.orders.detailTitle", { id: order.id })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 text-sm">
              <p>{t("admin.orders.status")}: {order.status}</p>
              <p>{t("admin.orders.total")}: {formatPrice(order.totalCents, order.currency, locale)}</p>
              <p>{t("admin.orders.session")}: {order.stripeCheckoutSessionId ?? "-"}</p>
              <p>{t("admin.orders.intent")}: {order.stripePaymentIntentId ?? "-"}</p>
              <p>{t("admin.orders.customer")}: {order.stripeCustomerId ?? "-"}</p>
              <p>
                {t("admin.orders.paidAt")}: {order.paidAt ? new Date(order.paidAt).toLocaleString(locale) : "-"}
              </p>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.orders.item")}</TableHead>
                  <TableHead>{t("admin.orders.quantity")}</TableHead>
                  <TableHead>{t("admin.orders.unit")}</TableHead>
                  <TableHead>{t("admin.orders.total")}</TableHead>
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
