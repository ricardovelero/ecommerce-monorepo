import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { ErrorState } from "@/components/ErrorState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useAuthClient } from "@/features/auth/hooks/useAuthClient";
import { useAddToCart } from "@/features/cart/hooks/useAddToCart";
import { useProduct } from "@/features/products/hooks/useProduct";
import { usePageSeo } from "@/features/seo/usePageSeo";
import { formatPrice } from "@/lib/utils";

export function ProductDetailPage() {
  const { id, lang } = useParams();
  const { t, i18n } = useTranslation();
  const { data: product, isLoading, isError, refetch } = useProduct(id);
  const addToCart = useAddToCart();
  const authClient = useAuthClient();
  const { notify } = useToast();
  const locale = i18n.language === "en" ? "en-US" : "es-ES";
  const activeLang = lang ?? "es";

  usePageSeo({
    title: product ? t("seo.product.title", { name: product.name }) : t("seo.product.fallbackTitle"),
    description: product?.description ?? t("seo.product.fallbackDescription"),
    canonicalPath: `/${activeLang}/products/${id ?? ""}`,
  });

  async function onAddToCart() {
    if (!product) {
      return;
    }

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
    return <ProductDetailSkeleton />;
  }

  if (isError) {
    return (
      <ErrorState
        title={t("errors.productTitle")}
        description={t("errors.productDescription")}
        actionLabel={t("errors.retry")}
        onAction={() => void refetch()}
      />
    );
  }

  if (!product) {
    return <ErrorState title={t("errors.productTitle")} description={t("errors.notFound")} />;
  }

  return (
    <Card>
      {product.imageUrl ? (
        <img src={product.imageUrl} alt={product.name} className="h-72 w-full object-cover" />
      ) : (
        <div className="flex h-72 items-center justify-center bg-muted text-sm text-muted-foreground">
          {t("products.noImage")}
        </div>
      )}
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Badge>{product.categoryName}</Badge>
        <p className="text-muted-foreground">{product.description}</p>
        <p className="text-lg font-semibold">{formatPrice(product.priceCents, product.currency, locale)}</p>
        <Button onClick={() => void onAddToCart()} disabled={addToCart.isPending}>
          {t("products.add")}
        </Button>
      </CardContent>
    </Card>
  );
}

function ProductDetailSkeleton() {
  return (
    <Card>
      <Skeleton className="h-72 w-full rounded-none" />
      <CardHeader>
        <Skeleton className="h-8 w-2/3" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-36" />
      </CardContent>
    </Card>
  );
}
