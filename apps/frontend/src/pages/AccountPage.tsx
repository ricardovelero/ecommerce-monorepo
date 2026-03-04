import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthClient } from "@/features/auth/hooks/useAuthClient";

export function AccountPage() {
  const authClient = useAuthClient();
  const { t } = useTranslation();
  const { lang } = useParams();
  const prefix = `/${lang ?? "es"}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("account.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p>{authClient.isAuthenticated() ? t("account.statusAuthenticated") : t("account.statusGuest")}</p>
        {authClient.isAuthenticated() ? (
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link to={`${prefix}/account/orders`}>{t("account.orders")}</Link>
            </Button>
            <Button onClick={() => void authClient.signOut()}>{t("account.signout")}</Button>
          </div>
        ) : (
          <Button onClick={() => void authClient.signIn()}>{t("account.signin")}</Button>
        )}
      </CardContent>
    </Card>
  );
}
