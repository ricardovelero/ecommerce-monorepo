import type { CheckoutSessionRequestDTO, CheckoutSessionResponseDTO } from "@ecommerce/shared-types";
import { useMutation } from "@tanstack/react-query";

import { useHttpClient } from "@/features/shared/api/useHttpClient";

export function useCreateCheckoutSession() {
  const http = useHttpClient();

  return useMutation({
    mutationFn: (payload: CheckoutSessionRequestDTO) => http.post<CheckoutSessionResponseDTO>("/api/checkout/session", payload),
  });
}
