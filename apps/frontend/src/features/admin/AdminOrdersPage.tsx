import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

import { ErrorState } from "@/components/ErrorState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminNav } from "@/features/admin/AdminNav";
import { useAdminOrders } from "@/features/admin/hooks/useAdminOrders";
import { formatPrice } from "@/lib/utils";

export function AdminOrdersPage() {
  const { t } = useTranslation();
  const { data: orders = [], isLoading, isError, refetch } = useAdminOrders();
  const { lang } = useParams();
  const locale = lang === "en" ? "en-US" : "es-ES";
  const prefix = `/${lang ?? "es"}/admin`;

  return (
    <section className="space-y-4">
      <AdminNav />
      <h1 className="text-2xl font-semibold">{t("admin.orders.title")}</h1>

      {isLoading ? (
        <AdminTableSkeleton />
      ) : isError ? (
        <ErrorState
          title={t("errors.adminOrdersTitle")}
          description={t("errors.adminOrdersDescription")}
          actionLabel={t("errors.retry")}
          onAction={() => void refetch()}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("admin.orders.columns.order")}</TableHead>
              <TableHead>{t("admin.orders.columns.user")}</TableHead>
              <TableHead>{t("admin.orders.columns.status")}</TableHead>
              <TableHead>{t("admin.orders.columns.total")}</TableHead>
              <TableHead>{t("admin.orders.columns.paidAt")}</TableHead>
              <TableHead className="text-right">{t("admin.orders.columns.action")}</TableHead>
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
                    <Link to={`${prefix}/orders/${order.id}`}>{t("common.detail")}</Link>
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

function AdminTableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  );
}
