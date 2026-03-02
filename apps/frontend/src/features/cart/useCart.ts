import type { CartDTO } from "@ecommerce/shared-types";
import { useCallback, useEffect, useState } from "react";

import { useHttpClient } from "@/features/shared/api/useHttpClient";

const emptyCart: CartDTO = {
  id: "local-empty",
  status: "OPEN",
  items: [],
};

export function useCart() {
  const http = useHttpClient();
  const [cart, setCart] = useState<CartDTO>(emptyCart);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const next = await http.get<CartDTO>("/api/cart");
    setCart(next);
  }, [http]);

  const addItem = useCallback(
    async (productId: string, quantity = 1) => {
      const next = await http.post<CartDTO>("/api/cart/items", { productId, quantity });
      setCart(next);
    },
    [http],
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      const next = await http.delete<CartDTO>(`/api/cart/items/${itemId}`);
      setCart(next);
    },
    [http],
  );

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  return {
    cart,
    loading,
    refresh,
    addItem,
    removeItem,
  };
}
