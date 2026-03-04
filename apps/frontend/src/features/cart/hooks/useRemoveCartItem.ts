import type { CartDTO } from "@ecommerce/shared-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { cartQueryKey, emptyCart } from "@/features/cart/hooks/useCart";
import { useHttpClient } from "@/features/shared/api/useHttpClient";

interface RemoveContext {
  previousCart: CartDTO;
}

export function useRemoveCartItem() {
  const http = useHttpClient();
  const queryClient = useQueryClient();

  return useMutation<CartDTO, Error, { itemId: string }, RemoveContext>({
    mutationFn: ({ itemId }) => http.delete<CartDTO>(`/api/cart/items/${itemId}`),
    onMutate: async ({ itemId }) => {
      await queryClient.cancelQueries({ queryKey: cartQueryKey });
      const previousCart = queryClient.getQueryData<CartDTO>(cartQueryKey) ?? emptyCart;
      queryClient.setQueryData<CartDTO>(cartQueryKey, {
        ...previousCart,
        items: previousCart.items.filter((item) => item.id !== itemId),
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
