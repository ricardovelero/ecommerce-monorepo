import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePageSeo } from "@/features/seo/usePageSeo";

export function CheckoutCancelPage() {
  const { lang } = useParams();
  const { t } = useTranslation();
  const prefix = `/${lang ?? "es"}`;
  const activeLang = lang ?? "es";

  usePageSeo({
    title: t("seo.checkoutCancel.title"),
    description: t("seo.checkoutCancel.description"),
    canonicalPath: `/${activeLang}/checkout/cancel`,
    robots: "noindex,nofollow",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("checkout.cancelTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{t("checkout.cancelDescription")}</p>
        <div className="flex gap-2">
          <Button asChild>
            <Link to={`${prefix}/cart`}>{t("checkout.returnCart")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to={`${prefix}/products`}>{t("checkout.continueShopping")}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
