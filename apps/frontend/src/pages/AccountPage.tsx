import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthClient } from "@/features/auth/hooks/useAuthClient";

export function AccountPage() {
  const authClient = useAuthClient();
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("account.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p>{authClient.isAuthenticated() ? "Authenticated" : "Guest"}</p>
        {authClient.isAuthenticated() ? (
          <Button onClick={() => void authClient.signOut()}>{t("account.signout")}</Button>
        ) : (
          <Button onClick={() => void authClient.signIn()}>{t("account.signin")}</Button>
        )}
      </CardContent>
    </Card>
  );
}
