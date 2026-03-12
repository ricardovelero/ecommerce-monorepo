import type { CartDTO } from "@ecommerce/shared-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { cartQueryKey, emptyCart } from "@/features/cart/hooks/useCart";
import { useHttpClient } from "@/features/shared/api/useHttpClient";

interface UpdateQuantityInput {
  itemId: string;
  nextQuantity: number;
}

interface UpdateContext {
  previousCart: CartDTO;
}

export function useUpdateCartItemQuantity() {
  const http = useHttpClient();
  const queryClient = useQueryClient();

  return useMutation<CartDTO, Error, UpdateQuantityInput, UpdateContext>({
    mutationFn: async ({ itemId, nextQuantity }) => {
      if (nextQuantity <= 0) {
        return http.delete<CartDTO>(`/api/cart/items/${itemId}`);
      }

      return http.patch<CartDTO>(`/api/cart/items/${itemId}`, {
        quantity: nextQuantity,
      });
    },
    onMutate: async ({ itemId, nextQuantity }) => {
      await queryClient.cancelQueries({ queryKey: cartQueryKey });
      const previousCart = queryClient.getQueryData<CartDTO>(cartQueryKey) ?? emptyCart;

      queryClient.setQueryData<CartDTO>(cartQueryKey, {
        ...previousCart,
        items:
          nextQuantity <= 0
            ? previousCart.items.filter((item) => item.id !== itemId)
            : previousCart.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      quantity: nextQuantity,
                    }
                  : item,
              ),
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
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: cartQueryKey });
    },
  });
}
