import type { OrderDTO } from "@ecommerce/shared-types";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

import { ErrorState } from "@/components/ErrorState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminNav } from "@/features/admin/AdminNav";
import { useAdminOrder, useUpdateAdminOrderFulfillment } from "@/features/admin/hooks/useAdminOrders";
import { formatPrice } from "@/lib/utils";

function toDateTimeLocalValue(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function toIsoString(value: string): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

export function AdminOrderDetailPage() {
  const { t } = useTranslation();
  const { id, lang } = useParams();
  const { data: order, isLoading, isError, refetch } = useAdminOrder(id);
  const updateFulfillment = useUpdateAdminOrderFulfillment(id);
  const prefix = `/${lang ?? "es"}/admin`;
  const locale = lang === "en" ? "en-US" : "es-ES";
  const [fulfillmentStatus, setFulfillmentStatus] = useState("UNFULFILLED");
  const [shippingCarrier, setShippingCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [fulfilledAt, setFulfilledAt] = useState("");

  useEffect(() => {
    if (!order) {
      return;
    }

    setFulfillmentStatus(order.fulfillmentStatus);
    setShippingCarrier(order.shippingCarrier ?? "");
    setTrackingNumber(order.trackingNumber ?? "");
    setTrackingUrl(order.trackingUrl ?? "");
    setFulfilledAt(toDateTimeLocalValue(order.fulfilledAt));
  }, [order]);

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
              <p>{t("admin.orders.fulfillmentStatus")}: {order.fulfillmentStatus}</p>
              <p>{t("admin.orders.total")}: {formatPrice(order.totalCents, order.currency, locale)}</p>
              <p>{t("admin.orders.session")}: {order.stripeCheckoutSessionId ?? "-"}</p>
              <p>{t("admin.orders.intent")}: {order.stripePaymentIntentId ?? "-"}</p>
              <p>{t("admin.orders.customer")}: {order.stripeCustomerId ?? "-"}</p>
              <p>{t("admin.orders.shippingCarrier")}: {order.shippingCarrier ?? "-"}</p>
              <p>{t("admin.orders.trackingNumber")}: {order.trackingNumber ?? "-"}</p>
              <p>
                {t("admin.orders.trackingUrl")}:{" "}
                {order.trackingUrl ? (
                  <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="underline">
                    {order.trackingUrl}
                  </a>
                ) : (
                  "-"
                )}
              </p>
              <p>
                {t("admin.orders.paidAt")}: {order.paidAt ? new Date(order.paidAt).toLocaleString(locale) : "-"}
              </p>
              <p>
                {t("admin.orders.fulfilledAt")}: {order.fulfilledAt ? new Date(order.fulfilledAt).toLocaleString(locale) : "-"}
              </p>
            </div>

            <div className="grid gap-3 rounded-lg border p-4 md:grid-cols-2">
              <div>
                <label className="text-sm text-muted-foreground">{t("admin.orders.fulfillmentStatus")}</label>
                <select
                  className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={fulfillmentStatus}
                  onChange={(event) => setFulfillmentStatus(event.target.value)}
                >
                  <option value="UNFULFILLED">{t("fulfillment.unfulfilled")}</option>
                  <option value="PROCESSING">{t("fulfillment.processing")}</option>
                  <option value="SHIPPED">{t("fulfillment.shipped")}</option>
                  <option value="DELIVERED">{t("fulfillment.delivered")}</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">{t("admin.orders.shippingCarrier")}</label>
                <Input value={shippingCarrier} onChange={(event) => setShippingCarrier(event.target.value)} className="mt-1" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">{t("admin.orders.trackingNumber")}</label>
                <Input value={trackingNumber} onChange={(event) => setTrackingNumber(event.target.value)} className="mt-1" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">{t("admin.orders.trackingUrl")}</label>
                <Input value={trackingUrl} onChange={(event) => setTrackingUrl(event.target.value)} className="mt-1" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">{t("admin.orders.fulfilledAt")}</label>
                <Input
                  type="datetime-local"
                  value={fulfilledAt}
                  onChange={(event) => setFulfilledAt(event.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() =>
                    updateFulfillment.mutate({
                      fulfillmentStatus: fulfillmentStatus as OrderDTO["fulfillmentStatus"],
                      shippingCarrier: shippingCarrier.trim() || null,
                      trackingNumber: trackingNumber.trim() || null,
                      trackingUrl: trackingUrl.trim() || null,
                      fulfilledAt: toIsoString(fulfilledAt),
                    })
                  }
                  disabled={updateFulfillment.isPending}
                >
                  {t("common.save")}
                </Button>
              </div>
            </div>

            <div className="grid gap-2 rounded-lg border p-4 text-sm">
              <p className="font-medium">{t("admin.orders.shippingTitle")}</p>
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
