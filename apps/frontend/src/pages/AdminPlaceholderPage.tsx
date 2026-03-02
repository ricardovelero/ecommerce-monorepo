import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminPlaceholderPage() {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("admin.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Badge variant="accent">Phase 2</Badge>
        <p className="text-muted-foreground">{t("admin.placeholder")}</p>
      </CardContent>
    </Card>
  );
}
