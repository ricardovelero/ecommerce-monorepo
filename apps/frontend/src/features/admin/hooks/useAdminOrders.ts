import type { OrderDTO } from "@ecommerce/shared-types";
import { useQuery } from "@tanstack/react-query";

import { useHttpClient } from "@/features/shared/api/useHttpClient";

export function useAdminOrders() {
  const http = useHttpClient();

  return useQuery({
    queryKey: ["admin", "orders"],
    queryFn: () => http.get<OrderDTO[]>("/api/admin/orders"),
  });
}

export function useAdminOrder(orderId: string | undefined) {
  const http = useHttpClient();

  return useQuery({
    queryKey: ["admin", "orders", orderId],
    queryFn: () => http.get<OrderDTO>(`/api/admin/orders/${orderId}`),
    enabled: Boolean(orderId),
  });
}
