import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams, useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { useAuthStatus } from "@/features/auth/hooks/useAuthStatus";
import { useCheckoutSessionStatus } from "@/features/orders/hooks/useCheckoutSessionStatus";
import { useReconcileCheckoutSession } from "@/features/orders/hooks/useReconcileCheckoutSession";

export function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { lang } = useParams();
  const { t } = useTranslation();
  const prefix = `/${lang ?? "es"}`;
  const queryClient = useQueryClient();
  const { notify } = useToast();
  const { isLoaded, isSignedIn } = useAuthStatus();
  const reconcileCheckoutSession = useReconcileCheckoutSession();
  const firstSeenAtRef = useRef<number | null>(null);
  const hasQueuedFallbackRef = useRef(false);
  const checkoutStatus = useCheckoutSessionStatus(sessionId, isLoaded && isSignedIn);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !sessionId || !checkoutStatus.data) {
      return;
    }

    if (checkoutStatus.data.status === "existing") {
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
      void queryClient.invalidateQueries({ queryKey: ["cart"] });
      return;
    }

    if (checkoutStatus.data.status === "pending_payment") {
      return;
    }

    if (firstSeenAtRef.current === null) {
      firstSeenAtRef.current = Date.now();
    }

    const elapsedMs = Date.now() - firstSeenAtRef.current;
    if (elapsedMs < 8000 || hasQueuedFallbackRef.current || reconcileCheckoutSession.isPending) {
      return;
    }

    hasQueuedFallbackRef.current = true;
    reconcileCheckoutSession.mutate(sessionId, {
      onSettled: () => {
        void checkoutStatus.refetch();
      },
    });
  }, [
    checkoutStatus,
    isLoaded,
    isSignedIn,
    queryClient,
    reconcileCheckoutSession,
    sessionId,
  ]);

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
