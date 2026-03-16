import type { HomeMerchandisingResponseDTO } from "@ecommerce/shared-types";
import { useQuery } from "@tanstack/react-query";

import { useHttpClient } from "@/features/shared/api/useHttpClient";

export const homeMerchandisingQueryKey = ["merchandising", "homepage"] as const;

export function useHomeMerchandising() {
  const http = useHttpClient();

  return useQuery({
    queryKey: homeMerchandisingQueryKey,
    queryFn: () => http.get<HomeMerchandisingResponseDTO>("/api/merchandising/homepage"),
  });
}
