import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function HomePage() {
  const { t } = useTranslation();
  const { lang } = useParams();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("home.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">{t("home.subtitle")}</p>
        <Button asChild>
          <Link to={`/${lang ?? "es"}/products`}>{t("nav.products")}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
