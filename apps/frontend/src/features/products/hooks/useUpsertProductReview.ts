import type { ProductReviewDTO, UpsertProductReviewDTO, ViewerReviewStateDTO } from "@ecommerce/shared-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useHttpClient } from "@/features/shared/api/useHttpClient";

interface ProductReviewBlockResponse {
  reviewSummary: {
    averageRating: number | null;
    reviewCount: number;
  };
  reviews: ProductReviewDTO[];
  viewerReviewState?: ViewerReviewStateDTO;
}

export function useUpsertProductReview(productId: string | undefined) {
  const http = useHttpClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpsertProductReviewDTO) => {
      if (!productId) {
        throw new Error("Product id is required");
      }

      return http.put<ProductReviewBlockResponse>(`/api/products/${productId}/reviews/me`, input);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["products", productId],
      });
    },
  });
}
