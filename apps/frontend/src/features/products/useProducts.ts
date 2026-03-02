import type { ProductDTO } from "@ecommerce/shared-types";
import { useEffect, useState } from "react";

import { useHttpClient } from "@/features/shared/api/useHttpClient";

export function useProducts() {
  const http = useHttpClient();
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    http
      .get<ProductDTO[]>("/api/products")
      .then((data) => {
        if (mounted) setProducts(data);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [http]);

  return { products, loading };
}
