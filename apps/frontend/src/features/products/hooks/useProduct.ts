import type { ProductDTO } from "@ecommerce/shared-types";
import { useQuery } from "@tanstack/react-query";

import { useHttpClient } from "@/features/shared/api/useHttpClient";

export function useProduct(productId: string | undefined) {
  const http = useHttpClient();

  return useQuery({
    queryKey: ["products", productId],
    queryFn: () => http.get<ProductDTO>(`/api/products/${productId}`),
    enabled: Boolean(productId),
  });
}
