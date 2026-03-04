import type { CartDTO } from "@ecommerce/shared-types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { useAuthStatus } from "@/features/auth/hooks/useAuthStatus";
import { useHttpClient } from "@/features/shared/api/useHttpClient";

export const cartQueryKey = ["cart"] as const;

const emptyCart: CartDTO = {
  id: "local-empty",
  status: "OPEN",
  items: [],
};

export function useCart() {
  const http = useHttpClient();
  const queryClient = useQueryClient();
  const { isLoaded, isSignedIn } = useAuthStatus();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      void queryClient.invalidateQueries({ queryKey: cartQueryKey });
    }
  }, [isLoaded, isSignedIn, queryClient]);

  return useQuery({
    queryKey: cartQueryKey,
    queryFn: () => http.get<CartDTO>("/api/cart"),
    placeholderData: emptyCart,
    enabled: isLoaded,
  });
}

export { emptyCart };
