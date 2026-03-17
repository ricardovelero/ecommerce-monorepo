import type { ProductDTO } from "@ecommerce/shared-types";
import { queryOptions, useQuery } from "@tanstack/react-query";

import type { ApiGetClient } from "@/features/shared/api/ApiClient";
import { useHttpClient } from "@/features/shared/api/useHttpClient";

export function getProductQueryOptions(http: ApiGetClient, productId: string | undefined) {
  return queryOptions({
    queryKey: ["products", productId] as const,
    queryFn: () => http.get<ProductDTO>(`/api/products/${productId}`),
    enabled: Boolean(productId),
  });
}

export function useProduct(productId: string | undefined) {
  const http = useHttpClient();

  return useQuery(getProductQueryOptions(http, productId));
}
