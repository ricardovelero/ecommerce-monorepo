import type { CheckoutReconcileResponseDTO } from "@ecommerce/shared-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ordersQueryKey } from "@/features/orders/hooks/useOrders";
import { useHttpClient } from "@/features/shared/api/useHttpClient";

export function useReconcileCheckoutSession() {
  const http = useHttpClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) =>
      http.post<CheckoutReconcileResponseDTO>(`/api/checkout/session/${sessionId}/reconcile`, {}),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ordersQueryKey });
      void queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}
