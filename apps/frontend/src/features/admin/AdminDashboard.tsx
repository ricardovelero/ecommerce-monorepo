import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminNav } from "@/features/admin/AdminNav";

export function AdminDashboard() {
  const { lang } = useParams();
  const { t } = useTranslation();
  const prefix = `/${lang ?? "es"}/admin`;

  return (
    <section>
      <AdminNav />
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t("admin.products.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-muted-foreground">{t("admin.dashboard.productsDescription")}</p>
            <Link className="text-sm font-medium underline" to={`${prefix}/products`}>
              {t("admin.dashboard.productsLink")}
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("admin.categories.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-muted-foreground">{t("admin.dashboard.categoriesDescription")}</p>
            <Link className="text-sm font-medium underline" to={`${prefix}/categories`}>
              {t("admin.dashboard.categoriesLink")}
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("admin.orders.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-muted-foreground">{t("admin.dashboard.ordersDescription")}</p>
            <Link className="text-sm font-medium underline" to={`${prefix}/orders`}>
              {t("admin.dashboard.ordersLink")}
            </Link>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
