import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams, useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

export function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { lang } = useParams();
  const { t } = useTranslation();
  const prefix = `/${lang ?? "es"}`;
  const queryClient = useQueryClient();
  const { notify } = useToast();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
      void queryClient.invalidateQueries({ queryKey: ["cart"] });
      notify(t("toast.orderCreated"));
    }, 1800);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [notify, queryClient, t]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("checkout.successTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{t("checkout.successDescription")}</p>
        {sessionId ? <p className="text-xs text-muted-foreground">Session: {sessionId}</p> : null}
        <div className="flex gap-2">
          <Button asChild>
            <Link to={`${prefix}/account/orders`}>{t("checkout.orderHistory")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to={`${prefix}`}>{t("checkout.backHome")}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
