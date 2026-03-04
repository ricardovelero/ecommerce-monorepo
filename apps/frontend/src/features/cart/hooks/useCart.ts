import type { CartDTO } from "@ecommerce/shared-types";
import { useQuery } from "@tanstack/react-query";

import { useHttpClient } from "@/features/shared/api/useHttpClient";

export const cartQueryKey = ["cart"] as const;

const emptyCart: CartDTO = {
  id: "local-empty",
  status: "OPEN",
  items: [],
};

export function useCart() {
  const http = useHttpClient();

  return useQuery({
    queryKey: cartQueryKey,
    queryFn: () => http.get<CartDTO>("/api/cart"),
    placeholderData: emptyCart,
  });
}

export { emptyCart };
