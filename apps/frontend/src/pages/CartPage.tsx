import { useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthClient } from "@/features/auth/hooks/useAuthClient";
import { useToast } from "@/components/ui/toast";
import { useCart } from "@/features/cart/useCart";
import { useHttpClient } from "@/features/shared/api/useHttpClient";
import { formatPrice } from "@/lib/utils";

export function CartPage() {
  const { t, i18n } = useTranslation();
  const { cart, loading, removeItem } = useCart();
  const authClient = useAuthClient();
  const http = useHttpClient();
  const { notify } = useToast();
  const { lang } = useParams();
  const [redirecting, setRedirecting] = useState(false);

  const subtotalCents = cart.items.reduce((acc, item) => acc + item.priceCents * item.quantity, 0);

  async function checkout() {
    if (!authClient.isAuthenticated()) {
      await authClient.signIn();
      return;
    }

    setRedirecting(true);
    try {
      const response = await http.post<{ url: string }>("/api/checkout/session", {
        lang: lang === "en" ? "en" : "es",
      });
      window.location.href = response.url;
    } catch {
      notify("Unable to start checkout");
      setRedirecting(false);
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("cart.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {cart.items.length === 0 ? (
          <p className="text-muted-foreground">{t("cart.empty")}</p>
        ) : (
          <>
            {cart.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-sm text-muted-foreground">x{item.quantity}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span>
                    {formatPrice(
                      item.priceCents * item.quantity,
                      "EUR",
                      i18n.language === "en" ? "en-US" : "es-ES",
                    )}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => {
                      void removeItem(item.id).then(() => notify(t("toast.removed")));
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
              <div>
                <p className="font-medium">Subtotal</p>
                <p className="text-sm text-muted-foreground">
                  {formatPrice(subtotalCents, "EUR", i18n.language === "en" ? "en-US" : "es-ES")}
                </p>
              </div>
              <Button onClick={() => void checkout()} disabled={redirecting}>
                {redirecting ? "Redirecting..." : "Checkout"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
