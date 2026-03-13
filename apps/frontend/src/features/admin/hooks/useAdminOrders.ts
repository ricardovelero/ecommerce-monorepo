import type { AdminOrderFulfillmentUpdateDTO, OrderDTO } from "@ecommerce/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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

export function useUpdateAdminOrderFulfillment(orderId: string | undefined) {
  const http = useHttpClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminOrderFulfillmentUpdateDTO) =>
      http.patch<OrderDTO>(`/api/admin/orders/${orderId}/fulfillment`, payload),
    onSuccess: (order) => {
      queryClient.setQueryData(["admin", "orders", orderId], order);
      void queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
  });
}
