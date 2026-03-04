import type { ProductDTO } from "@ecommerce/shared-types";
import { useQuery } from "@tanstack/react-query";

import { useHttpClient } from "@/features/shared/api/useHttpClient";

export const productsQueryKey = ["products"] as const;

export function useProducts() {
  const http = useHttpClient();

  return useQuery({
    queryKey: productsQueryKey,
    queryFn: () => http.get<ProductDTO[]>("/api/products"),
  });
}
