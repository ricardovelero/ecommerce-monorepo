import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { useCart } from "@/features/cart/useCart";
import { useProducts } from "@/features/products/useProducts";
import { formatPrice } from "@/lib/utils";

export function ProductsPage() {
  const { t, i18n } = useTranslation();
  const { products, loading } = useProducts();
  const { addItem } = useCart();
  const { notify } = useToast();
  const { lang } = useParams();

  if (loading) return <p>Loading...</p>;

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">{t("products.title")}</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <CardTitle className="text-base">{product.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Badge>{product.categoryName}</Badge>
              <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
              <p className="font-medium">
                {formatPrice(product.priceCents, product.currency, i18n.language === "en" ? "en-US" : "es-ES")}
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    void addItem(product.id).then(() => notify(t("toast.added")));
                  }}
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
