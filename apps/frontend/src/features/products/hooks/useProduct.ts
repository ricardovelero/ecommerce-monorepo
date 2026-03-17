import type { ProductDetailDTO } from "@ecommerce/shared-types";
import { queryOptions, useQuery } from "@tanstack/react-query";

import type { ApiGetClient } from "@/features/shared/api/ApiClient";
import { useAuthClient } from "@/features/auth/hooks/useAuthClient";
import { useHttpClient } from "@/features/shared/api/useHttpClient";

export function getProductQueryOptions(
  http: ApiGetClient,
  productId: string | undefined,
  viewerScope: "guest" | "authenticated" = "guest",
) {
  return queryOptions({
    queryKey: ["products", productId, viewerScope] as const,
    queryFn: () => http.get<ProductDetailDTO>(`/api/products/${productId}`),
    enabled: Boolean(productId),
  });
}

export function useProduct(productId: string | undefined) {
  const http = useHttpClient();
  const authClient = useAuthClient();
  const viewerScope = authClient.isAuthenticated() ? "authenticated" : "guest";

  return useQuery(getProductQueryOptions(http, productId, viewerScope));
}
