import type { AdminAnalyticsDTO } from "@ecommerce/shared-types";
import { useQuery } from "@tanstack/react-query";

import { useHttpClient } from "@/features/shared/api/useHttpClient";

export function useAdminAnalytics() {
  const http = useHttpClient();

  return useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: () => http.get<AdminAnalyticsDTO>("/api/admin/analytics"),
  });
}
