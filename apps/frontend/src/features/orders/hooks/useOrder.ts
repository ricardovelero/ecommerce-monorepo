import type { OrderDTO } from "@ecommerce/shared-types";
import { useQuery } from "@tanstack/react-query";

import { useHttpClient } from "@/features/shared/api/useHttpClient";

export function useOrder(orderId: string | undefined) {
  const http = useHttpClient();

  return useQuery({
    queryKey: ["orders", orderId],
    queryFn: () => http.get<OrderDTO>(`/api/orders/${orderId}`),
    enabled: Boolean(orderId),
  });
}
