import type { AdminAnalyticsDTO } from "@ecommerce/shared-types";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

import { ErrorState } from "@/components/ErrorState";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminNav } from "@/features/admin/AdminNav";
import { useAdminAnalytics } from "@/features/admin/hooks/useAdminAnalytics";
import { formatPrice } from "@/lib/utils";

export function AdminDashboard() {
  const { lang } = useParams();
  const { t } = useTranslation();
  const prefix = `/${lang ?? "es"}/admin`;
  const locale = lang === "en" ? "en-US" : "es-ES";
  const { data, isLoading, isError, refetch } = useAdminAnalytics();

  if (isLoading) {
    return (
      <section>
        <AdminNav />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-base">{t("admin.dashboard.loading")}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (isError || !data) {
    return (
      <section>
        <AdminNav />
        <ErrorState
          title={t("errors.adminAnalyticsTitle")}
          description={t("errors.adminAnalyticsDescription")}
          actionLabel={t("errors.retry")}
          onAction={() => void refetch()}
        />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <AdminNav />
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title={t("admin.dashboard.totalRevenue")}
          value={formatPrice(data.revenue.totalRevenueCents, "EUR", locale)}
        />
        <MetricCard title={t("admin.dashboard.paidOrders")} value={String(data.revenue.paidOrders)} />
        <MetricCard
          title={t("admin.dashboard.averageOrderValue")}
          value={formatPrice(data.revenue.averageOrderValueCents, "EUR", locale)}
        />
        <MetricCard title={t("admin.dashboard.repeatCustomers")} value={String(data.customers.repeatCustomers)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{t("admin.dashboard.revenueTrend")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.revenueTrend.map((point) => (
              <div key={point.date} className="flex items-center justify-between border-b pb-2 text-sm last:border-b-0">
                <span>{new Date(point.date).toLocaleDateString(locale)}</span>
                <span className="text-muted-foreground">{point.orders} {t("admin.dashboard.ordersShort")}</span>
                <span className="font-medium">{formatPrice(point.revenueCents, "EUR", locale)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("admin.dashboard.inventoryRisk")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>{t("admin.dashboard.lowStock")}</span>
              <Badge variant="accent">{data.inventoryRisk.lowStockCount}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>{t("admin.dashboard.outOfStock")}</span>
              <Badge className="bg-red-100 text-red-700">{data.inventoryRisk.outOfStockCount}</Badge>
            </div>
            <div className="space-y-2">
              {data.inventoryRisk.lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between text-sm">
                  <Link className="underline" to={`${prefix}/products`}>
                    {product.name}
                  </Link>
                  <span className="text-muted-foreground">{product.stock}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <StatusCard
          title={t("admin.dashboard.orderPipeline")}
          items={data.orderStatusBreakdown}
          valueLabel={t("admin.dashboard.ordersLabel")}
        />
        <StatusCard
          title={t("admin.dashboard.fulfillmentPipeline")}
          items={data.fulfillmentBreakdown}
          valueLabel={t("admin.dashboard.ordersLabel")}
        />
        <Card>
          <CardHeader>
            <CardTitle>{t("admin.dashboard.customersTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span>{t("admin.dashboard.totalCustomers")}</span>
              <span className="font-medium">{data.customers.totalCustomers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>{t("admin.dashboard.repeatCustomers")}</span>
              <span className="font-medium">{data.customers.repeatCustomers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>{t("admin.dashboard.firstTimeCustomers")}</span>
              <span className="font-medium">{data.customers.firstTimeCustomers}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.dashboard.topProducts")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.topProducts.map((product) => (
            <div key={product.productId} className="flex items-center justify-between gap-3 border-b pb-2 text-sm last:border-b-0">
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-muted-foreground">
                  {product.unitsSold} {t("admin.dashboard.unitsSold")}
                </p>
              </div>
              <p className="font-medium">{formatPrice(product.revenueCents, "EUR", locale)}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <QuickLinkCard
          title={t("admin.products.title")}
          description={t("admin.dashboard.productsDescription")}
          href={`${prefix}/products`}
          linkLabel={t("admin.dashboard.productsLink")}
        />
        <QuickLinkCard
          title={t("admin.categories.title")}
          description={t("admin.dashboard.categoriesDescription")}
          href={`${prefix}/categories`}
          linkLabel={t("admin.dashboard.categoriesLink")}
        />
        <QuickLinkCard
          title={t("admin.orders.title")}
          description={t("admin.dashboard.ordersDescription")}
          href={`${prefix}/orders`}
          linkLabel={t("admin.dashboard.ordersLink")}
        />
      </div>
    </section>
  );
}

function MetricCard({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

function StatusCard({
  title,
  items,
  valueLabel,
}: {
  title: string;
  items: AdminAnalyticsDTO["orderStatusBreakdown"];
  valueLabel: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between text-sm">
            <span>{item.label}</span>
            <span className="font-medium">
              {item.value} {valueLabel}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function QuickLinkCard({
  title,
  description,
  href,
  linkLabel,
}: {
  title: string;
  description: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-sm text-muted-foreground">{description}</p>
        <Link className="text-sm font-medium underline" to={href}>
          {linkLabel}
        </Link>
      </CardContent>
    </Card>
  );
}
