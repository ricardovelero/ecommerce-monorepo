import type { ProductListQueryDTO, ProductListResponseDTO } from "@ecommerce/shared-types";
import { queryOptions, useQuery } from "@tanstack/react-query";

import type { ApiGetClient } from "@/features/shared/api/ApiClient";
import { useHttpClient } from "@/features/shared/api/useHttpClient";

export const productsQueryKey = ["products"] as const;

export function buildProductsQueryString(query: ProductListQueryDTO) {
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

  return searchParams.toString();
}

export function getProductsQueryOptions(http: ApiGetClient, query: ProductListQueryDTO) {
  const queryString = buildProductsQueryString(query);

  return queryOptions({
    queryKey: [...productsQueryKey, query] as const,
    queryFn: () => http.get<ProductListResponseDTO>(`/api/products${queryString ? `?${queryString}` : ""}`),
  });
}

export function useProducts(query: ProductListQueryDTO) {
  const http = useHttpClient();

  return useQuery(getProductsQueryOptions(http, query));
}
