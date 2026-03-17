import assert from "node:assert/strict";
import test from "node:test";

import { createProductReviewService } from "@/services/reviewService";
import { HttpError } from "@/utils/httpError";

function createReviewServiceFixture() {
  const product = { id: "product_1" };
  const productId = product.id;
  const reviewTimestamps = [
    new Date("2026-03-17T09:00:00.000Z"),
    new Date("2026-03-17T10:00:00.000Z"),
    new Date("2026-03-17T11:00:00.000Z"),
    new Date("2026-03-17T12:00:00.000Z"),
  ];
  let reviewTimestampIndex = 0;
  const reviews: Array<{
    id: string;
    productId: string;
    userId: string;
    verifiedOrderId: string;
    rating: number;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
  }> = [];
  const orders = [
    {
      id: "order_delivered_latest",
      userId: "user_1",
      status: "PAID" as const,
      fulfillmentStatus: "DELIVERED" as const,
      createdAt: new Date("2026-03-16T12:00:00.000Z"),
      items: [{ productId }],
    },
    {
      id: "order_processing",
      userId: "user_2",
      status: "PAID" as const,
      fulfillmentStatus: "PROCESSING" as const,
      createdAt: new Date("2026-03-16T10:00:00.000Z"),
      items: [{ productId }],
    },
  ];

  const service = createProductReviewService({
    prismaClient: {
      product: {
        async findUnique({ where }) {
          return where.id === productId ? product : null;
        },
      },
      order: {
        async findFirst({ where }) {
          const matching = orders
            .filter(
              (order) =>
                order.userId === where.userId &&
                order.status === where.status &&
                (!where.fulfillmentStatus || order.fulfillmentStatus === where.fulfillmentStatus) &&
                order.items.some((item) => item.productId === where.items.some.productId),
            )
            .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());

          return matching[0]
            ? {
                id: matching[0].id,
                createdAt: matching[0].createdAt,
              }
            : null;
        },
      },
      review: {
        async findMany({ where }) {
          return reviews
            .filter((review) => review.productId === where.productId)
            .sort((left, right) => right.updatedAt.getTime() - left.updatedAt.getTime())
            .map((review) => ({
              id: review.id,
              rating: review.rating,
              comment: review.comment,
              createdAt: review.createdAt,
              updatedAt: review.updatedAt,
            }));
        },
        async aggregate({ where }) {
          const matching = reviews.filter((review) => review.productId === where.productId);
          return {
            _avg: {
              rating:
                matching.length > 0
                  ? matching.reduce((total, review) => total + review.rating, 0) / matching.length
                  : null,
            },
            _count: {
              _all: matching.length,
            },
          };
        },
        async findUnique({ where }) {
          const review = reviews.find(
            (entry) =>
              entry.productId === where.productId_userId.productId && entry.userId === where.productId_userId.userId,
          );

          return review
            ? {
                id: review.id,
                rating: review.rating,
                comment: review.comment,
                createdAt: review.createdAt,
                updatedAt: review.updatedAt,
              }
            : null;
        },
        async upsert({ where, create, update }) {
          const existing = reviews.find(
            (entry) =>
              entry.productId === where.productId_userId.productId && entry.userId === where.productId_userId.userId,
          );

          if (existing) {
            existing.rating = update.rating;
            existing.comment = update.comment;
            existing.verifiedOrderId = update.verifiedOrderId;
            existing.updatedAt = reviewTimestamps[reviewTimestampIndex++] ?? new Date();
            return {
              id: existing.id,
              rating: existing.rating,
              comment: existing.comment,
              createdAt: existing.createdAt,
              updatedAt: existing.updatedAt,
            };
          }

          const timestamp = reviewTimestamps[reviewTimestampIndex++] ?? new Date();
          const inserted = {
            id: `review_${reviews.length + 1}`,
            productId: create.productId,
            userId: create.userId,
            verifiedOrderId: create.verifiedOrderId,
            rating: create.rating,
            comment: create.comment,
            createdAt: timestamp,
            updatedAt: timestamp,
          };
          reviews.push(inserted);
          return {
            id: inserted.id,
            rating: inserted.rating,
            comment: inserted.comment,
            createdAt: inserted.createdAt,
            updatedAt: inserted.updatedAt,
          };
        },
      },
    },
  });

  return { service, reviews, orders, productId };
}

test("upsertOwnProductReview creates a review for a delivered buyer", async () => {
  const { service, productId } = createReviewServiceFixture();

  const result = await service.upsertOwnProductReview("user_1", productId, {
    rating: 5,
    comment: "Excellent product.",
  });

  assert.equal(result.reviewSummary.reviewCount, 1);
  assert.equal(result.reviewSummary.averageRating, 5);
  assert.equal(result.reviews.length, 1);
  assert.equal(result.reviews[0].comment, "Excellent product.");
  assert.deepEqual(result.viewerReviewState, {
    canReview: true,
    reason: null,
    existingReview: result.reviews[0],
  });
});

test("upsertOwnProductReview updates an existing review instead of inserting a duplicate", async () => {
  const { service, reviews, productId } = createReviewServiceFixture();

  await service.upsertOwnProductReview("user_1", productId, {
    rating: 4,
    comment: "Good.",
  });
  const updated = await service.upsertOwnProductReview("user_1", productId, {
    rating: 5,
    comment: "Updated review.",
  });

  assert.equal(reviews.length, 1);
  assert.equal(updated.reviewSummary.reviewCount, 1);
  assert.equal(updated.reviewSummary.averageRating, 5);
  assert.equal(updated.viewerReviewState?.existingReview?.comment, "Updated review.");
});

test("upsertOwnProductReview rejects users who never bought the product", async () => {
  const { service, productId } = createReviewServiceFixture();

  await assert.rejects(
    () =>
      service.upsertOwnProductReview("user_3", productId, {
        rating: 5,
        comment: "Should fail.",
      }),
    (error: unknown) =>
      error instanceof HttpError &&
      error.statusCode === 403 &&
      error.message === "Only verified buyers can review this product",
  );
});

test("upsertOwnProductReview rejects paid orders that are not delivered yet", async () => {
  const { service, productId } = createReviewServiceFixture();

  await assert.rejects(
    () =>
      service.upsertOwnProductReview("user_2", productId, {
        rating: 4,
        comment: "Should wait.",
      }),
    (error: unknown) =>
      error instanceof HttpError && error.statusCode === 403 && error.message === "Review requires a delivered order",
  );
});

test("getProductReviewSnapshot recalculates average rating and count", async () => {
  const { service, reviews, productId } = createReviewServiceFixture();

  reviews.push({
    id: "review_seed",
    productId,
    userId: "user_9",
    verifiedOrderId: "order_seed",
    rating: 4,
    comment: "Strong baseline.",
    createdAt: new Date("2026-03-17T08:30:00.000Z"),
    updatedAt: new Date("2026-03-17T08:30:00.000Z"),
  });

  const result = await service.upsertOwnProductReview("user_1", productId, {
    rating: 5,
    comment: "Excellent product.",
  });

  assert.equal(result.reviewSummary.reviewCount, 2);
  assert.equal(result.reviewSummary.averageRating, 4.5);
});
