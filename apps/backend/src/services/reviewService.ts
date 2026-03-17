import type {
  ProductReviewDTO,
  ProductReviewSummaryDTO,
  UpsertProductReviewDTO,
  ViewerReviewStateDTO,
} from "@ecommerce/shared-types";

import { prisma } from "@/db/prisma";
import { HttpError } from "@/utils/httpError";

type ReviewRecord = {
  id: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
};

type EligibleOrderRecord = {
  id: string;
  createdAt: Date;
};

type ProductReviewServicePrisma = {
  product: {
    findUnique: (args: { where: { id: string }; select: { id: true } }) => Promise<{ id: string } | null>;
  };
  order: {
    findFirst: (args: {
      where: {
        userId: string;
        status: "PAID";
        fulfillmentStatus?: "DELIVERED";
        items: {
          some: {
            productId: string;
          };
        };
      };
      select: { id: true; createdAt: true };
      orderBy: { createdAt: "desc" };
    }) => Promise<EligibleOrderRecord | null>;
  };
  review: {
    findMany: (args: {
      where: { productId: string };
      orderBy: { updatedAt: "desc" };
      select: {
        id: true;
        rating: true;
        comment: true;
        createdAt: true;
        updatedAt: true;
      };
    }) => Promise<ReviewRecord[]>;
    aggregate: (args: {
      where: { productId: string };
      _avg: { rating: true };
      _count: { _all: true };
    }) => Promise<{ _avg: { rating: number | null }; _count: { _all: number } }>;
    findUnique: (args: {
      where: {
        productId_userId: {
          productId: string;
          userId: string;
        };
      };
      select: {
        id: true;
        rating: true;
        comment: true;
        createdAt: true;
        updatedAt: true;
      };
    }) => Promise<ReviewRecord | null>;
    upsert: (args: {
      where: {
        productId_userId: {
          productId: string;
          userId: string;
        };
      };
      create: {
        productId: string;
        userId: string;
        verifiedOrderId: string;
        rating: number;
        comment: string;
      };
      update: {
        verifiedOrderId: string;
        rating: number;
        comment: string;
      };
      select: {
        id: true;
        rating: true;
        comment: true;
        createdAt: true;
        updatedAt: true;
      };
    }) => Promise<ReviewRecord>;
  };
};

export interface ProductReviewSnapshotDTO {
  reviewSummary: ProductReviewSummaryDTO;
  reviews: ProductReviewDTO[];
  viewerReviewState?: ViewerReviewStateDTO;
}

function toProductReviewDTO(review: ReviewRecord): ProductReviewDTO {
  return {
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
    isVerifiedBuyer: true,
  };
}

async function findMostRecentPaidOrderWithProduct(
  prismaClient: ProductReviewServicePrisma,
  userId: string,
  productId: string,
  deliveredOnly: boolean,
): Promise<EligibleOrderRecord | null> {
  return prismaClient.order.findFirst({
    where: {
      userId,
      status: "PAID",
      ...(deliveredOnly ? { fulfillmentStatus: "DELIVERED" as const } : {}),
      items: {
        some: {
          productId,
        },
      },
    },
    select: {
      id: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export function createProductReviewService(
  deps: {
    prismaClient: ProductReviewServicePrisma;
  } = {
    prismaClient: prisma,
  },
) {
  return {
    async getProductReviewSnapshot(productId: string, viewerUserId?: string): Promise<ProductReviewSnapshotDTO> {
      const [summary, reviews, existingReview, deliveredOrder, paidOrder] = await Promise.all([
        deps.prismaClient.review.aggregate({
          where: { productId },
          _avg: { rating: true },
          _count: { _all: true },
        }),
        deps.prismaClient.review.findMany({
          where: { productId },
          orderBy: { updatedAt: "desc" },
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        viewerUserId
          ? deps.prismaClient.review.findUnique({
              where: {
                productId_userId: {
                  productId,
                  userId: viewerUserId,
                },
              },
              select: {
                id: true,
                rating: true,
                comment: true,
                createdAt: true,
                updatedAt: true,
              },
            })
          : Promise.resolve(null),
        viewerUserId
          ? findMostRecentPaidOrderWithProduct(deps.prismaClient, viewerUserId, productId, true)
          : Promise.resolve(null),
        viewerUserId
          ? findMostRecentPaidOrderWithProduct(deps.prismaClient, viewerUserId, productId, false)
          : Promise.resolve(null),
      ]);

      const reviewSummary: ProductReviewSummaryDTO = {
        averageRating: summary._avg.rating,
        reviewCount: summary._count._all,
      };

      const snapshot: ProductReviewSnapshotDTO = {
        reviewSummary,
        reviews: reviews.map(toProductReviewDTO),
      };

      if (!viewerUserId) {
        return snapshot;
      }

      snapshot.viewerReviewState = {
        canReview: Boolean(deliveredOrder),
        reason: deliveredOrder ? null : paidOrder ? "NOT_DELIVERED" : "NOT_PURCHASED",
        existingReview: existingReview ? toProductReviewDTO(existingReview) : null,
      };

      return snapshot;
    },

    async upsertOwnProductReview(
      userId: string,
      productId: string,
      input: UpsertProductReviewDTO,
    ): Promise<ProductReviewSnapshotDTO> {
      const product = await deps.prismaClient.product.findUnique({
        where: { id: productId },
        select: { id: true },
      });

      if (!product) {
        throw new HttpError(404, "Product not found");
      }

      const deliveredOrder = await findMostRecentPaidOrderWithProduct(deps.prismaClient, userId, productId, true);

      if (!deliveredOrder) {
        const paidOrder = await findMostRecentPaidOrderWithProduct(deps.prismaClient, userId, productId, false);
        throw new HttpError(
          403,
          paidOrder ? "Review requires a delivered order" : "Only verified buyers can review this product",
        );
      }

      await deps.prismaClient.review.upsert({
        where: {
          productId_userId: {
            productId,
            userId,
          },
        },
        create: {
          productId,
          userId,
          verifiedOrderId: deliveredOrder.id,
          rating: input.rating,
          comment: input.comment,
        },
        update: {
          verifiedOrderId: deliveredOrder.id,
          rating: input.rating,
          comment: input.comment,
        },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return this.getProductReviewSnapshot(productId, userId);
    },
  };
}

const productReviewService = createProductReviewService();

export async function getProductReviewSnapshot(productId: string, viewerUserId?: string): Promise<ProductReviewSnapshotDTO> {
  return productReviewService.getProductReviewSnapshot(productId, viewerUserId);
}

export async function upsertOwnProductReview(
  userId: string,
  productId: string,
  input: UpsertProductReviewDTO,
): Promise<ProductReviewSnapshotDTO> {
  return productReviewService.upsertOwnProductReview(userId, productId, input);
}
