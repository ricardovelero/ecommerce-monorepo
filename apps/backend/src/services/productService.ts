import type { ProductDTO, ProductDetailDTO, ProductListQueryDTO, ProductListResponseDTO, ProductSort } from "@ecommerce/shared-types";
import { Prisma } from "@prisma/client";

import { prisma } from "@/db/prisma";
import { getProductReviewSnapshot } from "@/services/reviewService";
import { HttpError } from "@/utils/httpError";

function toProductDTO(product: {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  stock: number;
  currency: string;
  imageUrl: string | null;
  categoryId: string;
  category: { name: string };
}, reviewSummary?: ProductDTO["reviewSummary"]): ProductDTO {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    priceCents: product.priceCents,
    stock: product.stock,
    currency: product.currency,
    imageUrl: product.imageUrl,
    categoryId: product.categoryId,
    categoryName: product.category.name,
    ...(reviewSummary ? { reviewSummary } : {}),
  };
}

function buildReviewSummaryMap(
  reviews: Array<{
    productId: string;
    rating: number;
  }>,
): Map<string, NonNullable<ProductDTO["reviewSummary"]>> {
  const totals = new Map<string, { ratingTotal: number; reviewCount: number }>();

  for (const review of reviews) {
    const current = totals.get(review.productId) ?? {
      ratingTotal: 0,
      reviewCount: 0,
    };

    current.ratingTotal += review.rating;
    current.reviewCount += 1;
    totals.set(review.productId, current);
  }

  return new Map(
    [...totals.entries()].map(([productId, summary]) => [
      productId,
      {
        averageRating: summary.reviewCount > 0 ? summary.ratingTotal / summary.reviewCount : null,
        reviewCount: summary.reviewCount,
      },
    ]),
  );
}

function getOrderBy(sort: ProductSort): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "price_asc":
      return { priceCents: "asc" };
    case "price_desc":
      return { priceCents: "desc" };
    case "name_asc":
      return { name: "asc" };
    case "newest":
    default:
      return { createdAt: "desc" };
  }
}

export function createProductCatalogService(
  deps: {
    prismaClient: Pick<typeof prisma, "$transaction" | "product" | "category" | "review">;
    getProductReviewSnapshotFn: typeof getProductReviewSnapshot;
  } = {
    prismaClient: prisma,
    getProductReviewSnapshotFn: getProductReviewSnapshot,
  },
) {
  return {
    async listProducts(input: ProductListQueryDTO): Promise<ProductListResponseDTO> {
      const pageSize = Math.min(24, Math.max(1, input.pageSize ?? 9));
      const sort = input.sort ?? "newest";
      const search = input.search?.trim();
      const categoryId = input.categoryId?.trim();

      const where: Prisma.ProductWhereInput = {
        ...(search
          ? {
              OR: [
                {
                  name: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  description: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),
        ...(categoryId ? { categoryId } : {}),
      };

      const [totalItems, categories] = await deps.prismaClient.$transaction([
        deps.prismaClient.product.count({ where }),
        deps.prismaClient.category.findMany({
          orderBy: { name: "asc" },
          select: { id: true, name: true },
        }),
      ]);

      const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
      const page = Math.min(Math.max(1, input.page ?? 1), totalPages);

      const products = await deps.prismaClient.product.findMany({
        where,
        include: { category: true },
        orderBy: getOrderBy(sort),
        skip: (page - 1) * pageSize,
        take: pageSize,
      });

      const reviewSummaryMap = buildReviewSummaryMap(
        await deps.prismaClient.review.findMany({
          where: {
            productId: {
              in: products.map((product) => product.id),
            },
          },
          select: {
            productId: true,
            rating: true,
          },
        }),
      );

      return {
        items: products.map((product) => toProductDTO(product, reviewSummaryMap.get(product.id))),
        categories,
        page,
        pageSize,
        totalItems,
        totalPages,
      };
    },

    async getProductById(id: string, viewerUserId?: string): Promise<ProductDetailDTO> {
      const product = await deps.prismaClient.product.findUnique({
        where: { id },
        include: { category: true },
      });

      if (!product) {
        throw new HttpError(404, "Product not found");
      }

      const reviewSnapshot = await deps.getProductReviewSnapshotFn(id, viewerUserId);

      return {
        ...toProductDTO(product),
        ...reviewSnapshot,
      };
    },
  };
}

const productCatalogService = createProductCatalogService();

export async function listProducts(input: ProductListQueryDTO): Promise<ProductListResponseDTO> {
  return productCatalogService.listProducts(input);
}

export async function getProductById(id: string, viewerUserId?: string): Promise<ProductDetailDTO> {
  return productCatalogService.getProductById(id, viewerUserId);
}
