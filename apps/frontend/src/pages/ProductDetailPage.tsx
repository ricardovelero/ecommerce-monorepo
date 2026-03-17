import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { ErrorState } from "@/components/ErrorState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { useAuthClient } from "@/features/auth/hooks/useAuthClient";
import { useAddToCart } from "@/features/cart/hooks/useAddToCart";
import { useProduct } from "@/features/products/hooks/useProduct";
import { useUpsertProductReview } from "@/features/products/hooks/useUpsertProductReview";
import { usePageSeo } from "@/features/seo/usePageSeo";
import { formatPrice } from "@/lib/utils";

export function ProductDetailPage() {
  const { id, lang } = useParams();
  const { t, i18n } = useTranslation();
  const { data: product, isLoading, isError, refetch } = useProduct(id);
  const addToCart = useAddToCart();
  const upsertReview = useUpsertProductReview(id);
  const authClient = useAuthClient();
  const { notify } = useToast();
  const locale = i18n.language === "en" ? "en-US" : "es-ES";
  const activeLang = lang ?? "es";
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  usePageSeo({
    title: product ? t("seo.product.title", { name: product.name }) : t("seo.product.fallbackTitle"),
    description: product?.description ?? t("seo.product.fallbackDescription"),
    canonicalPath: `/${activeLang}/products/${id ?? ""}`,
  });

  useEffect(() => {
    setRating(String(product?.viewerReviewState?.existingReview?.rating ?? 5));
    setComment(product?.viewerReviewState?.existingReview?.comment ?? "");
    setFormError(null);
  }, [product?.viewerReviewState?.existingReview]);

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

  function validateReviewForm() {
    const parsedRating = Number(rating);
    if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return t("reviews.validation.rating");
    }

    if (comment.trim().length === 0 || comment.trim().length > 1000) {
      return t("reviews.validation.comment");
    }

    return null;
  }

  async function onSubmitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!product) {
      return;
    }

    const errorMessage = validateReviewForm();
    if (errorMessage) {
      setFormError(errorMessage);
      return;
    }

    setFormError(null);
    upsertReview.mutate(
      {
        rating: Number(rating),
        comment: comment.trim(),
      },
      {
        onSuccess: () => {
          notify(t("reviews.saveSuccess"));
        },
        onError: () => {
          notify(t("reviews.saveError"));
        },
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
      <CardContent className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>{product.categoryName}</Badge>
          <Badge variant="accent">
            {product.reviewSummary.reviewCount === 0
              ? t("reviews.summary.none")
              : t("reviews.summary.value", {
                  average: product.reviewSummary.averageRating?.toFixed(1) ?? "0.0",
                  count: product.reviewSummary.reviewCount,
                })}
          </Badge>
        </div>
        <p className="text-muted-foreground">{product.description}</p>
        <p className="text-lg font-semibold">{formatPrice(product.priceCents, product.currency, locale)}</p>
        <Button onClick={() => void onAddToCart()} disabled={addToCart.isPending}>
          {t("products.add")}
        </Button>

        <section id="reviews" className="space-y-4 border-t pt-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">{t("reviews.title")}</h2>
            <p className="text-sm text-muted-foreground">
              {product.reviewSummary.reviewCount === 0
                ? t("reviews.empty")
                : t("reviews.summary.value", {
                    average: product.reviewSummary.averageRating?.toFixed(1) ?? "0.0",
                    count: product.reviewSummary.reviewCount,
                  })}
            </p>
          </div>

          {!authClient.isAuthenticated() ? (
            <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              <p>{t("reviews.signInPrompt")}</p>
              <Button className="mt-3" variant="outline" onClick={() => void authClient.signIn()}>
                {t("reviews.signInCta")}
              </Button>
            </div>
          ) : product.viewerReviewState?.canReview ? (
            <form className="space-y-3 rounded-lg border p-4" onSubmit={(event) => void onSubmitReview(event)}>
              <div className="space-y-1">
                <h3 className="font-medium">
                  {product.viewerReviewState.existingReview ? t("reviews.editTitle") : t("reviews.formTitle")}
                </h3>
                <p className="text-sm text-muted-foreground">{t("reviews.verifiedOnly")}</p>
              </div>
              <label className="grid gap-1 text-sm">
                <span>{t("reviews.fields.rating")}</span>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  step={1}
                  value={rating}
                  onChange={(event) => setRating(event.target.value)}
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span>{t("reviews.fields.comment")}</span>
                <Textarea
                  maxLength={1000}
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder={t("reviews.fields.commentPlaceholder")}
                />
              </label>
              {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
              <Button type="submit" disabled={upsertReview.isPending}>
                {product.viewerReviewState.existingReview ? t("reviews.updateAction") : t("reviews.submitAction")}
              </Button>
            </form>
          ) : (
            <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              <p>
                {product.viewerReviewState?.reason === "NOT_DELIVERED"
                  ? t("reviews.ineligible.notDelivered")
                  : t("reviews.ineligible.notPurchased")}
              </p>
            </div>
          )}

          <div className="space-y-3">
            {product.reviews.length === 0 ? null : (
              product.reviews.map((review) => (
                <article key={review.id} className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">{t("reviews.ratingValue", { rating: review.rating })}</p>
                    <Badge variant="accent">{t("reviews.verifiedBadge")}</Badge>
                    <p className="text-xs text-muted-foreground">{new Date(review.updatedAt).toLocaleDateString(locale)}</p>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{review.comment}</p>
                </article>
              ))
            )}
          </div>
        </section>
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
