import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

export function AppHeader() {
  const { t } = useTranslation();
  const { lang } = useParams();
  const prefix = `/${lang ?? "es"}`;

  return (
    <header className="border-b bg-card/70 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <Link to={prefix} className="text-lg font-bold tracking-tight">
          {t("brand")}
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link to={`${prefix}`}>{t("nav.home")}</Link>
          <Link to={`${prefix}/products`}>{t("nav.products")}</Link>
          <Link to={`${prefix}/cart`}>{t("nav.cart")}</Link>
          <Link to={`${prefix}/account`}>{t("nav.account")}</Link>
          <Link to={`${prefix}/admin`}>{t("nav.admin")}</Link>
        </nav>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
