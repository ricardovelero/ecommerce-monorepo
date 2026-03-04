import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { ErrorState } from "@/components/ErrorState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useAuthClient } from "@/features/auth/hooks/useAuthClient";
import { useCart } from "@/features/cart/hooks/useCart";
import { useCreateCheckoutSession } from "@/features/cart/hooks/useCreateCheckoutSession";
import { useRemoveCartItem } from "@/features/cart/hooks/useRemoveCartItem";
import { useUpdateCartItemQuantity } from "@/features/cart/hooks/useUpdateCartItemQuantity";
import { formatPrice } from "@/lib/utils";

export function CartPage() {
  const { t, i18n } = useTranslation();
  const { data: cart, isLoading, isError, refetch } = useCart();
  const removeCartItem = useRemoveCartItem();
  const updateQuantity = useUpdateCartItemQuantity();
  const createCheckoutSession = useCreateCheckoutSession();
  const authClient = useAuthClient();
  const { notify } = useToast();
  const { lang } = useParams();
  const [redirecting, setRedirecting] = useState(false);

  const locale = i18n.language === "en" ? "en-US" : "es-ES";
  const items = cart?.items ?? [];
  const subtotalCents = items.reduce((acc, item) => acc + item.priceCents * item.quantity, 0);

  async function checkout() {
    if (!authClient.isAuthenticated()) {
      await authClient.signIn();
      return;
    }

    setRedirecting(true);
    createCheckoutSession.mutate(lang === "en" ? "en" : "es", {
      onSuccess: (response) => {
        window.location.href = response.url;
      },
      onError: () => {
        notify(t("toast.checkoutError"));
        setRedirecting(false);
      },
    });
  }

  if (isLoading) {
    return <CartSkeleton />;
  }

  if (isError) {
    return (
      <ErrorState
        title={t("errors.cartTitle")}
        description={t("errors.cartDescription")}
        actionLabel={t("errors.retry")}
        onAction={() => void refetch()}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("cart.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <p className="text-muted-foreground">{t("cart.empty")}</p>
        ) : (
          <>
            {items.map((item) => (
              <div key={item.id} className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-sm text-muted-foreground">{formatPrice(item.priceCents, "EUR", locale)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor={`quantity-${item.id}`} className="text-sm text-muted-foreground">
                    {t("cart.quantity")}
                  </label>
                  <Input
                    id={`quantity-${item.id}`}
                    className="w-20"
                    type="number"
                    min={0}
                    max={50}
                    value={item.quantity}
                    onChange={(event) => {
                      const nextValue = Number(event.target.value);
                      const nextQuantity = Number.isNaN(nextValue) ? item.quantity : Math.max(0, nextValue);

                      updateQuantity.mutate(
                        {
                          itemId: item.id,
                          productId: item.productId,
                          nextQuantity,
                        },
                        {
                          onError: () => notify(t("toast.cartError")),
                        },
                      );
                    }}
                    aria-label={t("cart.quantityAria", { name: item.productName })}
                  />
                  <span className="w-20 text-right text-sm">
                    {formatPrice(item.priceCents * item.quantity, "EUR", locale)}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() =>
                      removeCartItem.mutate(
                        { itemId: item.id },
                        {
                          onSuccess: () => notify(t("toast.removed")),
                          onError: () => notify(t("toast.cartError")),
                        },
                      )
                    }
                    aria-label={t("cart.removeAria", { name: item.productName })}
                  >
                    {t("cart.remove")}
                  </Button>
                </div>
              </div>
            ))}
            <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">{t("cart.subtotal")}</p>
                <p className="text-sm text-muted-foreground">{formatPrice(subtotalCents, "EUR", locale)}</p>
              </div>
              <Button onClick={() => void checkout()} disabled={redirecting || createCheckoutSession.isPending}>
                {redirecting ? t("cart.redirecting") : t("cart.checkout")}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function CartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-40" />
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-lg border p-3">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="mt-2 h-4 w-1/4" />
            <div className="mt-3 flex gap-2">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-20" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
