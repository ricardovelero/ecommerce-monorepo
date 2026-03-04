import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

import { ErrorState } from "@/components/ErrorState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useAuthClient } from "@/features/auth/hooks/useAuthClient";
import { useAddToCart } from "@/features/cart/hooks/useAddToCart";
import { useProducts } from "@/features/products/hooks/useProducts";
import { formatPrice } from "@/lib/utils";

export function ProductsPage() {
  const { t, i18n } = useTranslation();
  const { data: products = [], isLoading, isError, refetch } = useProducts();
  const addToCart = useAddToCart();
  const authClient = useAuthClient();
  const { notify } = useToast();
  const { lang } = useParams();
  const locale = i18n.language === "en" ? "en-US" : "es-ES";

  async function onAddToCart(product: {
    id: string;
    name: string;
    priceCents: number;
  }) {
    if (!authClient.isAuthenticated()) {
      await authClient.signIn();
      return;
    }

    addToCart.mutate(
      {
        productId: product.id,
        quantity: 1,
        productName: product.name,
        priceCents: product.priceCents,
      },
      {
        onSuccess: () => notify(t("toast.added")),
        onError: () => notify(t("toast.cartError")),
      },
    );
  }

  if (isLoading) {
    return <ProductGridSkeleton />;
  }

  if (isError) {
    return (
      <ErrorState
        title={t("errors.productsTitle")}
        description={t("errors.productsDescription")}
        actionLabel={t("errors.retry")}
        onAction={() => void refetch()}
      />
    );
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">{t("products.title")}</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="h-48 w-full object-cover" loading="lazy" />
            ) : (
              <div className="flex h-48 items-center justify-center bg-muted text-sm text-muted-foreground">
                {t("products.noImage")}
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-base">{product.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Badge>{product.categoryName}</Badge>
              <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
              <p className="font-medium">{formatPrice(product.priceCents, product.currency, locale)}</p>
              <div className="flex gap-2">
                <Button
                  onClick={() => void onAddToCart(product)}
                  aria-label={t("products.addAria", { name: product.name })}
                  disabled={addToCart.isPending}
                >
                  {t("products.add")}
                </Button>
                <Button variant="outline" asChild>
                  <Link to={`/${lang ?? "es"}/products/${product.id}`}>{t("products.view")}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function ProductGridSkeleton() {
  return (
    <section className="space-y-6">
      <Skeleton className="h-8 w-44" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index}>
            <Skeleton className="h-48 w-full rounded-none" />
            <CardHeader>
              <Skeleton className="h-6 w-2/3" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-6 w-28" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-28" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
