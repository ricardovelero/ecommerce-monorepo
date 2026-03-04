import type { OrderDTO } from "@ecommerce/shared-types";
import { useQuery } from "@tanstack/react-query";

import { useHttpClient } from "@/features/shared/api/useHttpClient";

export const ordersQueryKey = ["orders"] as const;

export function useOrders() {
  const http = useHttpClient();

  return useQuery({
    queryKey: ordersQueryKey,
    queryFn: () => http.get<OrderDTO[]>("/api/orders"),
  });
}
