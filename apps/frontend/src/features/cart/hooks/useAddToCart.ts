import type { CartDTO } from "@ecommerce/shared-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { cartQueryKey, emptyCart } from "@/features/cart/hooks/useCart";
import { useHttpClient } from "@/features/shared/api/useHttpClient";

interface AddToCartInput {
  productId: string;
  quantity?: number;
  productName?: string;
  priceCents?: number;
}

interface AddContext {
  previousCart: CartDTO;
}

export function useAddToCart() {
  const http = useHttpClient();
  const queryClient = useQueryClient();

  return useMutation<CartDTO, Error, AddToCartInput, AddContext>({
    mutationFn: ({ productId, quantity = 1 }) => http.post<CartDTO>("/api/cart/items", { productId, quantity }),
    onMutate: async ({ productId, quantity = 1, productName, priceCents }) => {
      await queryClient.cancelQueries({ queryKey: cartQueryKey });
      const previousCart = queryClient.getQueryData<CartDTO>(cartQueryKey) ?? emptyCart;

      queryClient.setQueryData<CartDTO>(cartQueryKey, {
        ...previousCart,
        items: (() => {
          const existing = previousCart.items.find((item) => item.productId === productId);
          if (existing) {
            return previousCart.items.map((item) =>
              item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item,
            );
          }

          return [
            ...previousCart.items,
            {
              id: `optimistic-${productId}`,
              productId,
              productName: productName ?? "Product",
              priceCents: priceCents ?? 0,
              quantity,
            },
          ];
        })(),
      });

      return { previousCart };
    },
    onError: (_error, _variables, context) => {
      if (context) {
        queryClient.setQueryData(cartQueryKey, context.previousCart);
      }
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(cartQueryKey, cart);
    },
  });
}
