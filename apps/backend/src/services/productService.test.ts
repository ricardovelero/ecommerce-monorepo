import assert from "node:assert/strict";
import test from "node:test";

import { createProductCatalogService } from "@/services/productService";

const baseProduct = {
  id: "product_1",
  name: "Hydrating Serum",
  description: "Lightweight daily hydration.",
  priceCents: 1999,
  stock: 8,
  currency: "EUR",
  imageUrl: "https://cdn.example.com/serum.jpg",
  categoryId: "category_1",
  category: {
    name: "Skincare",
  },
};

test("getProductById omits viewer review state for anonymous requests", async () => {
  const service = createProductCatalogService({
    prismaClient: {
      $transaction: async () => [],
      product: {
        async findUnique() {
          return baseProduct;
        },
      },
      category: {
        async findMany() {
          return [];
        },
      },
    } as never,
    getProductReviewSnapshotFn: async () => ({
      reviewSummary: {
        averageRating: null,
        reviewCount: 0,
      },
      reviews: [],
    }),
  });

  const product = await service.getProductById(baseProduct.id);

  assert.equal(product.viewerReviewState, undefined);
  assert.equal(product.reviewSummary.reviewCount, 0);
});

test("getProductById includes viewer review state for authenticated requests", async () => {
  const service = createProductCatalogService({
    prismaClient: {
      $transaction: async () => [],
      product: {
        async findUnique() {
          return baseProduct;
        },
      },
      category: {
        async findMany() {
          return [];
        },
      },
    } as never,
    getProductReviewSnapshotFn: async (_productId, viewerUserId) => ({
      reviewSummary: {
        averageRating: 5,
        reviewCount: 1,
      },
      reviews: [
        {
          id: "review_1",
          rating: 5,
          comment: "Excellent.",
          createdAt: "2026-03-17T09:00:00.000Z",
          updatedAt: "2026-03-17T09:00:00.000Z",
          isVerifiedBuyer: true,
        },
      ],
      ...(viewerUserId
        ? {
            viewerReviewState: {
              canReview: true,
              reason: null,
              existingReview: {
                id: "review_1",
                rating: 5,
                comment: "Excellent.",
                createdAt: "2026-03-17T09:00:00.000Z",
                updatedAt: "2026-03-17T09:00:00.000Z",
                isVerifiedBuyer: true,
              },
            },
          }
        : {}),
    }),
  });

  const product = await service.getProductById(baseProduct.id, "user_1");

  assert.equal(product.viewerReviewState?.canReview, true);
  assert.equal(product.viewerReviewState?.existingReview?.id, "review_1");
});
