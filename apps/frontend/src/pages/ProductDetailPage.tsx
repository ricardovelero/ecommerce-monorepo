import type { ProductDTO } from "@ecommerce/shared-types";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHttpClient } from "@/features/shared/api/useHttpClient";
import { formatPrice } from "@/lib/utils";

export function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<ProductDTO | null>(null);
  const http = useHttpClient();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (!id) return;
    void http.get<ProductDTO>(`/api/products/${id}`).then(setProduct);
  }, [http, id]);

  if (!product) return <p>Loading...</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Badge>{product.categoryName}</Badge>
        <p className="text-muted-foreground">{product.description}</p>
        <p className="text-lg font-semibold">
          {formatPrice(product.priceCents, product.currency, i18n.language === "en" ? "en-US" : "es-ES")}
        </p>
      </CardContent>
    </Card>
  );
}
