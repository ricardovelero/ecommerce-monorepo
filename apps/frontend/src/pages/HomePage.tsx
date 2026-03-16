import type { ProductDTO } from "@ecommerce/shared-types";
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
import { useHomeMerchandising } from "@/features/merchandising/hooks/useHomeMerchandising";
import { formatPrice } from "@/lib/utils";

export function HomePage() {
  const { t, i18n } = useTranslation();
  const { lang } = useParams();
  const locale = i18n.language === "en" ? "en-US" : "es-ES";
  const authClient = useAuthClient();
  const addToCart = useAddToCart();
  const { notify } = useToast();
  const { data, isLoading, isError, refetch } = useHomeMerchandising();

  async function onAddToCart(product: ProductDTO) {
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
    return <HomePageSkeleton />;
  }

  if (isError || !data) {
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
    <section className="space-y-8">
      <Card className="overflow-hidden border-none bg-gradient-to-br from-stone-950 via-slate-900 to-amber-900 text-white shadow-xl">
        <CardContent className="grid gap-8 px-6 py-8 md:grid-cols-[1.15fr_0.85fr] md:px-10 md:py-12">
          <div className="space-y-5">
            <Badge className="bg-white/10 text-white hover:bg-white/10">{t("home.eyebrow")}</Badge>
            <div className="space-y-3">
              <h1 className="max-w-xl text-3xl font-semibold tracking-tight md:text-5xl">{t("home.title")}</h1>
              <p className="max-w-xl text-sm leading-6 text-white/75 md:text-base">{t("home.subtitle")}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="bg-white text-slate-950 hover:bg-white/90">
                <Link to={`/${lang ?? "es"}/products`}>{t("home.primaryCta")}</Link>
              </Button>
              <Button asChild variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10">
                <Link to={`/${lang ?? "es"}/products?sort=newest`}>{t("home.secondaryCta")}</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
            <HighlightStat
              label={t("home.stats.featured")}
              value={String(data.featuredProducts.length)}
              detail={t("home.stats.featuredDetail")}
            />
            <HighlightStat
              label={t("home.stats.bestSellers")}
              value={String(data.bestSellers.length)}
              detail={t("home.stats.bestSellersDetail")}
            />
            <HighlightStat
              label={t("home.stats.newArrivals")}
              value={String(data.newArrivals.length)}
              detail={t("home.stats.newArrivalsDetail")}
            />
          </div>
        </CardContent>
      </Card>

      <MerchandisingSection
        title={t("home.sections.featured.title")}
        description={t("home.sections.featured.description")}
        actionLabel={t("home.sectionCta")}
        actionHref={`/${lang ?? "es"}/products`}
        products={data.featuredProducts}
        locale={locale}
        lang={lang ?? "es"}
        isSubmitting={addToCart.isPending}
        onAddToCart={onAddToCart}
      />

      <MerchandisingSection
        title={t("home.sections.bestSellers.title")}
        description={t("home.sections.bestSellers.description")}
        actionLabel={t("home.sectionCta")}
        actionHref={`/${lang ?? "es"}/products?sort=name_asc`}
        products={data.bestSellers}
        locale={locale}
        lang={lang ?? "es"}
        isSubmitting={addToCart.isPending}
        onAddToCart={onAddToCart}
      />

      <MerchandisingSection
        title={t("home.sections.newArrivals.title")}
        description={t("home.sections.newArrivals.description")}
        actionLabel={t("home.sectionCta")}
        actionHref={`/${lang ?? "es"}/products?sort=newest`}
        products={data.newArrivals}
        locale={locale}
        lang={lang ?? "es"}
        isSubmitting={addToCart.isPending}
        onAddToCart={onAddToCart}
      />
    </section>
  );
}

function HighlightStat({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-white/55">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-white/70">{detail}</p>
    </div>
  );
}

function MerchandisingSection({
  title,
  description,
  actionLabel,
  actionHref,
  products,
  locale,
  lang,
  isSubmitting,
  onAddToCart,
}: {
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  products: ProductDTO[];
  locale: string;
  lang: string;
  isSubmitting: boolean;
  onAddToCart: (product: ProductDTO) => Promise<void>;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button asChild variant="outline">
          <Link to={actionHref}>{actionLabel}</Link>
        </Button>
      </div>

      {products.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{t("home.emptySection")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <Card key={`${title}-${product.id}`} className="overflow-hidden">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="h-52 w-full object-cover" loading="lazy" />
              ) : (
                <div className="flex h-52 items-center justify-center bg-muted text-sm text-muted-foreground">
                  {t("products.noImage")}
                </div>
              )}
              <CardHeader className="space-y-3">
                <Badge className="w-fit">{product.categoryName}</Badge>
                <CardTitle className="text-lg">{product.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="line-clamp-3 text-sm text-muted-foreground">{product.description}</p>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-lg font-semibold">{formatPrice(product.priceCents, product.currency, locale)}</p>
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t("home.readyToShip")}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => void onAddToCart(product)}
                    aria-label={t("products.addAria", { name: product.name })}
                    disabled={isSubmitting}
                  >
                    {t("products.add")}
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to={`/${lang}/products/${product.id}`}>{t("products.view")}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function HomePageSkeleton() {
  return (
    <section className="space-y-8">
      <Card>
        <CardContent className="space-y-4 px-6 py-8">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-12 w-3/5" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-36" />
          </div>
        </CardContent>
      </Card>

      {Array.from({ length: 3 }).map((_, sectionIndex) => (
        <div key={sectionIndex} className="space-y-4">
          <div className="flex items-end justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-72" />
            </div>
            <Skeleton className="hidden h-10 w-28 md:block" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, cardIndex) => (
              <Card key={cardIndex}>
                <Skeleton className="h-52 w-full rounded-none" />
                <CardHeader className="space-y-3">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-7 w-2/3" />
                </CardHeader>
                <CardContent className="space-y-4">
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
        </div>
      ))}
    </section>
  );
}
