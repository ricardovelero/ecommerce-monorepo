import assert from "node:assert/strict";
import test from "node:test";

import { createAdminProductService } from "@/services/adminProductService";

function createCategory() {
  return { id: "cat_1" };
}

function createProduct(overrides: Partial<{
  id: string;
  isFeatured: boolean;
  featuredRank: number | null;
}> = {}) {
  const now = new Date("2026-03-16T12:00:00.000Z");

  return {
    id: overrides.id ?? "prod_1",
    name: "Hydrating Serum",
    description: "Lightweight serum for daily hydration.",
    priceCents: 2290,
    stock: 10,
    currency: "EUR",
    imageUrl: null,
    isFeatured: overrides.isFeatured ?? false,
    featuredRank: overrides.featuredRank ?? null,
    categoryId: "cat_1",
    category: { name: "Skincare" },
    createdAt: now,
    updatedAt: now,
    createdById: "user_1",
    updatedById: "user_1",
  };
}

test("createAdminProduct defaults featured rank to 1 for featured products", async () => {
  let createArgs:
    | {
        data: {
          isFeatured: boolean;
          featuredRank: number | null;
        };
      }
    | undefined;

  const service = createAdminProductService({
    prismaClient: {
      category: {
        async findUnique() {
          return createCategory();
        },
      },
      product: {
        async findMany() {
          return [];
        },
        async create(args) {
          createArgs = args;
          return createProduct({
            isFeatured: args.data.isFeatured,
            featuredRank: args.data.featuredRank,
          });
        },
        async findUnique() {
          return null;
        },
        async update() {
          throw new Error("not used");
        },
        async delete() {
          throw new Error("not used");
        },
      },
    },
  });

  const product = await service.createAdminProduct({
    name: "Hydrating Serum",
    description: "Lightweight serum for daily hydration.",
    priceCents: 2290,
    stock: 10,
    currency: "EUR",
    imageUrl: null,
    isFeatured: true,
    featuredRank: null,
    categoryId: "cat_1",
    actorUserId: "user_1",
  });

  assert.equal(createArgs?.data.isFeatured, true);
  assert.equal(createArgs?.data.featuredRank, 1);
  assert.equal(product.isFeatured, true);
  assert.equal(product.featuredRank, 1);
});

test("updateAdminProduct clears featured rank when product is no longer featured", async () => {
  let updateArgs:
    | {
        data: {
          isFeatured: boolean;
          featuredRank: number | null;
        };
      }
    | undefined;

  const service = createAdminProductService({
    prismaClient: {
      category: {
        async findUnique() {
          return createCategory();
        },
      },
      product: {
        async findMany() {
          return [];
        },
        async create() {
          throw new Error("not used");
        },
        async findUnique({ where }) {
          if (where.id === "prod_1") {
            return { id: "prod_1" };
          }

          return null;
        },
        async update(args) {
          updateArgs = args;
          return createProduct({
            id: "prod_1",
            isFeatured: args.data.isFeatured,
            featuredRank: args.data.featuredRank,
          });
        },
        async delete() {
          throw new Error("not used");
        },
      },
    },
  });

  const product = await service.updateAdminProduct({
    id: "prod_1",
    name: "Hydrating Serum",
    description: "Lightweight serum for daily hydration.",
    priceCents: 2290,
    stock: 10,
    currency: "EUR",
    imageUrl: null,
    isFeatured: false,
    featuredRank: 3,
    categoryId: "cat_1",
    actorUserId: "user_2",
  });

  assert.equal(updateArgs?.data.isFeatured, false);
  assert.equal(updateArgs?.data.featuredRank, null);
  assert.equal(product.isFeatured, false);
  assert.equal(product.featuredRank, null);
});
