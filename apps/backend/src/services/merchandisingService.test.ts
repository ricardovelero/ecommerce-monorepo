import assert from "node:assert/strict";
import test from "node:test";

import { createMerchandisingService } from "@/services/merchandisingService";

function createProduct(input: {
  id: string;
  name: string;
  createdAt: string;
  featuredRank?: number | null;
  isFeatured?: boolean;
}) {
  return {
    id: input.id,
    name: input.name,
    description: `${input.name} description`,
    priceCents: 1000,
    stock: 10,
    currency: "EUR",
    imageUrl: null,
    isFeatured: input.isFeatured ?? false,
    featuredRank: input.featuredRank ?? null,
    categoryId: "cat_1",
    createdAt: new Date(input.createdAt),
    category: {
      name: "Skincare",
    },
  };
}

test("getHomeMerchandising sorts featured products and derives best sellers from paid orders", async () => {
  const featuredProducts = [
    createProduct({ id: "prod_older", name: "Older Featured", createdAt: "2026-03-14T10:00:00.000Z", isFeatured: true }),
    createProduct({
      id: "prod_rank_2",
      name: "Featured Rank 2",
      createdAt: "2026-03-15T10:00:00.000Z",
      featuredRank: 2,
      isFeatured: true,
    }),
    createProduct({
      id: "prod_rank_1",
      name: "Featured Rank 1",
      createdAt: "2026-03-16T10:00:00.000Z",
      featuredRank: 1,
      isFeatured: true,
    }),
  ];
  const allProducts = [
    ...featuredProducts,
    createProduct({ id: "prod_best", name: "Best Seller", createdAt: "2026-03-13T10:00:00.000Z" }),
    createProduct({ id: "prod_new", name: "Newest Product", createdAt: "2026-03-17T10:00:00.000Z" }),
  ];

  const service = createMerchandisingService({
    prismaClient: {
      product: {
        async findMany(args) {
          const input = args as {
            where?: { isFeatured?: boolean; id?: { in: string[] } };
            orderBy?: { createdAt: "desc" };
            take?: number;
          };

          if (input.where?.isFeatured) {
            return featuredProducts;
          }

          if (input.where?.id?.in) {
            return input.where.id.in
              .map((productId) => allProducts.find((product) => product.id === productId))
              .filter((product): product is (typeof allProducts)[number] => Boolean(product));
          }

          if (input.orderBy?.createdAt === "desc") {
            return [...allProducts]
              .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
              .slice(0, input.take);
          }

          return allProducts;
        },
      },
      order: {
        async findMany() {
          return [
            {
              items: [
                { productId: "prod_best", quantity: 4 },
                { productId: "prod_rank_1", quantity: 1 },
              ],
            },
            {
              items: [{ productId: "prod_rank_1", quantity: 3 }],
            },
          ];
        },
      },
    },
  });

  const merchandising = await service.getHomeMerchandising();

  assert.deepEqual(
    merchandising.featuredProducts.map((product) => product.id),
    ["prod_rank_1", "prod_rank_2", "prod_older"],
  );
  assert.deepEqual(
    merchandising.bestSellers.map((product) => product.id),
    ["prod_best", "prod_rank_1"],
  );
  assert.deepEqual(
    merchandising.newArrivals.map((product) => product.id),
    ["prod_new", "prod_rank_1", "prod_rank_2", "prod_older", "prod_best"],
  );
});
