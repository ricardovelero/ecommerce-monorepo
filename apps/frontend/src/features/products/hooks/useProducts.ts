import type { ProductListQueryDTO, ProductListResponseDTO } from "@ecommerce/shared-types";
import { useQuery } from "@tanstack/react-query";

import { useHttpClient } from "@/features/shared/api/useHttpClient";

export const productsQueryKey = ["products"] as const;

export function useProducts(query: ProductListQueryDTO) {
  const http = useHttpClient();
  const searchParams = new URLSearchParams();

  if (query.search) {
    searchParams.set("search", query.search);
  }
  if (query.categoryId) {
    searchParams.set("categoryId", query.categoryId);
  }
  if (query.sort) {
    searchParams.set("sort", query.sort);
  }
  if (query.page) {
    searchParams.set("page", String(query.page));
  }
  if (query.pageSize) {
    searchParams.set("pageSize", String(query.pageSize));
  }

  const queryString = searchParams.toString();

  return useQuery({
    queryKey: [...productsQueryKey, query] as const,
    queryFn: () => http.get<ProductListResponseDTO>(`/api/products${queryString ? `?${queryString}` : ""}`),
  });
}
