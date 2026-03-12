import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams, useSearchParams } from "react-router-dom";

import { ErrorState } from "@/components/ErrorState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useAuthClient } from "@/features/auth/hooks/useAuthClient";
import { useAddToCart } from "@/features/cart/hooks/useAddToCart";
import { useProducts } from "@/features/products/hooks/useProducts";
import { formatPrice } from "@/lib/utils";

export function ProductsPage() {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const addToCart = useAddToCart();
  const authClient = useAuthClient();
  const { notify } = useToast();
  const { lang } = useParams();
  const locale = i18n.language === "en" ? "en-US" : "es-ES";
  const [searchDraft, setSearchDraft] = useState(searchParams.get("search") ?? "");

  useEffect(() => {
    setSearchDraft(searchParams.get("search") ?? "");
  }, [searchParams]);

  const parsedPage = Number(searchParams.get("page") ?? "1");

  const query = useMemo(
    () => ({
      search: searchParams.get("search") ?? undefined,
      categoryId: searchParams.get("categoryId") ?? undefined,
      sort: (searchParams.get("sort") as "newest" | "price_asc" | "price_desc" | "name_asc" | null) ?? "newest",
      page: Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1,
      pageSize: 9,
    }),
    [parsedPage, searchParams],
  );

  const { data, isLoading, isError, refetch } = useProducts(query);
  const products = data?.items ?? [];
  const categories = data?.categories ?? [];
  const currentPage = data?.page ?? query.page;
  const totalPages = data?.totalPages ?? 1;

  function updateSearchParams(updates: Record<string, string | null>, resetPage = false) {
    const next = new URLSearchParams(searchParams);

    for (const [key, value] of Object.entries(updates)) {
      if (!value) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    }

    if (resetPage) {
      next.set("page", "1");
    }

    setSearchParams(next);
  }

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
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("products.title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("products.results", { count: data?.totalItems ?? 0 })}
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <form
            className="md:col-span-3"
            onSubmit={(event) => {
              event.preventDefault();
              updateSearchParams({ search: searchDraft.trim() || null }, true);
            }}
          >
            <Input
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder={t("products.searchPlaceholder")}
              aria-label={t("products.searchPlaceholder")}
            />
          </form>
          <select
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={query.categoryId ?? ""}
            onChange={(event) => updateSearchParams({ categoryId: event.target.value || null }, true)}
          >
            <option value="">{t("products.allCategories")}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={query.sort}
            onChange={(event) => updateSearchParams({ sort: event.target.value }, true)}
          >
            <option value="newest">{t("products.sort.newest")}</option>
            <option value="price_asc">{t("products.sort.priceAsc")}</option>
            <option value="price_desc">{t("products.sort.priceDesc")}</option>
            <option value="name_asc">{t("products.sort.nameAsc")}</option>
          </select>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSearchDraft("");
              setSearchParams(new URLSearchParams());
            }}
          >
            {t("products.clearFilters")}
          </Button>
        </div>
      </div>
      {products.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{t("products.noResults")}</p>
          </CardContent>
        </Card>
      ) : null}
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
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          disabled={currentPage <= 1}
          onClick={() => updateSearchParams({ page: String(currentPage - 1) })}
        >
          {t("products.pagination.previous")}
        </Button>
        <p className="text-sm text-muted-foreground">
          {t("products.pagination.page", { page: currentPage, totalPages })}
        </p>
        <Button
          variant="outline"
          disabled={currentPage >= totalPages}
          onClick={() => updateSearchParams({ page: String(currentPage + 1) })}
        >
          {t("products.pagination.next")}
        </Button>
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
