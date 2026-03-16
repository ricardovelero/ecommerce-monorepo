import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

import { ErrorState } from "@/components/ErrorState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuthClient } from "@/features/auth/hooks/useAuthClient";
import { useOrder } from "@/features/orders/hooks/useOrder";
import { usePageSeo } from "@/features/seo/usePageSeo";
import { formatPrice } from "@/lib/utils";

export function AccountOrderDetailPage() {
  const { lang, id } = useParams();
  const authClient = useAuthClient();
  const { data: order, isLoading, isError, refetch } = useOrder(id);
  const { t } = useTranslation();
  const prefix = `/${lang ?? "es"}`;
  const locale = lang === "en" ? "en-US" : "es-ES";
  const activeLang = lang ?? "es";

  usePageSeo({
    title: order ? t("seo.accountOrderDetail.title", { id: order.id.slice(0, 8) }) : t("seo.accountOrderDetail.fallbackTitle"),
    description: t("seo.accountOrderDetail.description"),
    canonicalPath: `/${activeLang}/account/orders/${id ?? ""}`,
    robots: "noindex,nofollow",
  });

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
        <CardTitle>{t("account.orderDetailTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button asChild size="sm" variant="outline">
          <Link to={`${prefix}/account/orders`}>{t("account.backToOrders")}</Link>
        </Button>

        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : isError ? (
          <ErrorState
            title={t("errors.generic")}
            description={t("account.loadingOrder")}
            actionLabel={t("errors.retry")}
            onAction={() => void refetch()}
          />
        ) : !order ? (
          <p className="text-sm text-muted-foreground">{t("account.orderNotFound")}</p>
        ) : (
          <>
            <div className="grid gap-2 text-sm">
              <p>{t("account.detail.orderId")}: {order.id}</p>
              <p>{t("account.detail.status")}: {order.status}</p>
              <p>{t("account.detail.fulfillmentStatus")}: {order.fulfillmentStatus}</p>
              <p>{t("account.detail.total")}: {formatPrice(order.totalCents, order.currency, locale)}</p>
              <p>{t("account.detail.created")}: {new Date(order.createdAt).toLocaleString(locale)}</p>
              <p>{t("account.detail.shippingCarrier")}: {order.shippingCarrier ?? "-"}</p>
              <p>{t("account.detail.trackingNumber")}: {order.trackingNumber ?? "-"}</p>
              <p>
                {t("account.detail.trackingUrl")}:{" "}
                {order.trackingUrl ? (
                  <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="underline">
                    {t("account.detail.trackShipment")}
                  </a>
                ) : (
                  "-"
                )}
              </p>
              {order.fulfilledAt ? <p>{t("account.detail.fulfilledAt")}: {new Date(order.fulfilledAt).toLocaleString(locale)}</p> : null}
            </div>

            <div className="grid gap-2 rounded-lg border p-4 text-sm">
              <p className="font-medium">{t("account.detail.shippingTitle")}</p>
              <p>{order.customerName ?? "-"}</p>
              <p>{order.phone ?? "-"}</p>
              <p>{order.shippingAddressLine1 ?? "-"}</p>
              {order.shippingAddressLine2 ? <p>{order.shippingAddressLine2}</p> : null}
              <p>{[order.shippingPostalCode, order.shippingCity].filter(Boolean).join(" ") || "-"}</p>
              <p>{order.shippingCountry ?? "-"}</p>
              {order.shippingNotes ? <p>{order.shippingNotes}</p> : null}
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("account.detail.item")}</TableHead>
                  <TableHead>{t("account.detail.quantity")}</TableHead>
                  <TableHead>{t("account.detail.unitPrice")}</TableHead>
                  <TableHead>{t("account.columns.total")}</TableHead>
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
