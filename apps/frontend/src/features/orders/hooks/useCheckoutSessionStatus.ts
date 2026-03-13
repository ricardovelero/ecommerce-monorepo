import type { CheckoutSessionStatusResponseDTO } from "@ecommerce/shared-types";
import { useQuery } from "@tanstack/react-query";

import { useHttpClient } from "@/features/shared/api/useHttpClient";

export function useCheckoutSessionStatus(sessionId: string | null, enabled = true) {
  const http = useHttpClient();

  return useQuery({
    queryKey: ["checkout", "session", sessionId, "status"],
    queryFn: () => http.get<CheckoutSessionStatusResponseDTO>(`/api/checkout/session/${sessionId}/status`),
    enabled: enabled && Boolean(sessionId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "existing" || status === "pending_payment" ? false : 2000;
    },
    retry: false,
  });
}
