import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";

export function AdminNav() {
  const { lang } = useParams();
  const { t } = useTranslation();
  const prefix = `/${lang ?? "es"}/admin`;

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      <Button asChild size="sm" variant="outline">
        <Link to={prefix}>{t("admin.nav.dashboard")}</Link>
      </Button>
      <Button asChild size="sm" variant="outline">
        <Link to={`${prefix}/products`}>{t("admin.nav.products")}</Link>
      </Button>
      <Button asChild size="sm" variant="outline">
        <Link to={`${prefix}/categories`}>{t("admin.nav.categories")}</Link>
      </Button>
      <Button asChild size="sm" variant="outline">
        <Link to={`${prefix}/orders`}>{t("admin.nav.orders")}</Link>
      </Button>
    </div>
  );
}
