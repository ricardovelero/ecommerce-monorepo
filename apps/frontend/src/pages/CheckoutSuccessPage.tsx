import { useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHttpClient } from "@/features/shared/api/useHttpClient";

export function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { lang } = useParams();
  const prefix = `/${lang ?? "es"}`;
  const http = useHttpClient();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void http.get("/api/orders").catch(() => undefined);
    }, 1800);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [http]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment received</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Your payment was successful. Order creation is confirmed server-side by webhook processing.
        </p>
        {sessionId ? <p className="text-xs text-muted-foreground">Session: {sessionId}</p> : null}
        <div className="flex gap-2">
          <Button asChild>
            <Link to={`${prefix}/account/orders`}>Go to order history</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to={`${prefix}`}>Back to home</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
