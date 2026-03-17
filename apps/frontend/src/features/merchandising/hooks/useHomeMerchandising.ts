import type { HomeMerchandisingResponseDTO } from "@ecommerce/shared-types";
import { queryOptions, useQuery } from "@tanstack/react-query";

import type { ApiGetClient } from "@/features/shared/api/ApiClient";
import { useHttpClient } from "@/features/shared/api/useHttpClient";

export const homeMerchandisingQueryKey = ["merchandising", "homepage"] as const;

export function getHomeMerchandisingQueryOptions(http: ApiGetClient) {
  return queryOptions({
    queryKey: homeMerchandisingQueryKey,
    queryFn: () => http.get<HomeMerchandisingResponseDTO>("/api/merchandising/homepage"),
  });
}

export function useHomeMerchandising() {
  const http = useHttpClient();

  return useQuery(getHomeMerchandisingQueryOptions(http));
}
