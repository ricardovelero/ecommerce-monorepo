import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { useCart } from "@/features/cart/useCart";
import { formatPrice } from "@/lib/utils";

export function CartPage() {
  const { t, i18n } = useTranslation();
  const { cart, loading, removeItem } = useCart();
  const { notify } = useToast();

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
          cart.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">{item.productName}</p>
                <p className="text-sm text-muted-foreground">x{item.quantity}</p>
              </div>
              <div className="flex items-center gap-2">
                <span>{formatPrice(item.priceCents * item.quantity, "EUR", i18n.language === "en" ? "en-US" : "es-ES")}</span>
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
          ))
        )}
      </CardContent>
    </Card>
  );
}
