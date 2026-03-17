import type { HomeMerchandisingResponseDTO, ProductDTO } from "@ecommerce/shared-types";
import { OrderStatus } from "@prisma/client";

import { prisma } from "@/db/prisma";

const HOMEPAGE_SECTION_LIMIT = 6;

type ProductRecord = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  stock: number;
  currency: string;
  imageUrl: string | null;
  isFeatured: boolean;
  featuredRank: number | null;
  categoryId: string;
  createdAt: Date;
  category: {
    name: string;
  };
};

function toProductDTO(product: ProductRecord): ProductDTO {
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
    reviewSummary: {
      averageRating: null,
      reviewCount: 0,
    },
  };
}

function sortFeaturedProducts(products: ProductRecord[]): ProductRecord[] {
  return [...products].sort((left, right) => {
    if (left.featuredRank === null && right.featuredRank === null) {
      return right.createdAt.getTime() - left.createdAt.getTime();
    }

    if (left.featuredRank === null) {
      return 1;
    }

    if (right.featuredRank === null) {
      return -1;
    }

    if (left.featuredRank !== right.featuredRank) {
      return left.featuredRank - right.featuredRank;
    }

    return right.createdAt.getTime() - left.createdAt.getTime();
  });
}

export function createMerchandisingService(deps: {
  prismaClient: {
    product: {
      findMany: (args: object) => Promise<ProductRecord[]>;
    };
    order: {
      findMany: (args: object) => Promise<Array<{ items: Array<{ productId: string; quantity: number }> }>>;
    };
  };
} = {
  prismaClient: prisma as unknown as {
    product: {
      findMany: (args: object) => Promise<ProductRecord[]>;
    };
    order: {
      findMany: (args: object) => Promise<Array<{ items: Array<{ productId: string; quantity: number }> }>>;
    };
  },
}) {
  async function getProductsByIdsInOrder(productIds: string[]): Promise<ProductDTO[]> {
    if (productIds.length === 0) {
      return [];
    }

    const products = await deps.prismaClient.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      include: {
        category: true,
      },
    });

    const byId = new Map(products.map((product) => [product.id, product]));

    return productIds
      .map((productId) => byId.get(productId))
      .filter((product): product is ProductRecord => Boolean(product))
      .map(toProductDTO);
  }

  return {
    async getHomeMerchandising(): Promise<HomeMerchandisingResponseDTO> {
      const [featuredProductsRaw, paidOrders, newArrivalsRaw] = await Promise.all([
        deps.prismaClient.product.findMany({
          where: {
            isFeatured: true,
          },
          include: {
            category: true,
          },
        }),
        deps.prismaClient.order.findMany({
          where: {
            status: OrderStatus.PAID,
          },
          select: {
            items: {
              select: {
                productId: true,
                quantity: true,
              },
            },
          },
        }),
        deps.prismaClient.product.findMany({
          include: {
            category: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: HOMEPAGE_SECTION_LIMIT,
        }),
      ]);

      const bestSellerCounts = new Map<string, number>();
      for (const order of paidOrders) {
        for (const item of order.items) {
          bestSellerCounts.set(item.productId, (bestSellerCounts.get(item.productId) ?? 0) + item.quantity);
        }
      }

      const bestSellerProductIds = [...bestSellerCounts.entries()]
        .sort((left, right) => right[1] - left[1])
        .slice(0, HOMEPAGE_SECTION_LIMIT)
        .map(([productId]) => productId);

      return {
        featuredProducts: sortFeaturedProducts(featuredProductsRaw)
          .slice(0, HOMEPAGE_SECTION_LIMIT)
          .map(toProductDTO),
        bestSellers: await getProductsByIdsInOrder(bestSellerProductIds),
        newArrivals: newArrivalsRaw.map(toProductDTO),
      };
    },
  };
}

const merchandisingService = createMerchandisingService();

export async function getHomeMerchandising(): Promise<HomeMerchandisingResponseDTO> {
  return merchandisingService.getHomeMerchandising();
}
