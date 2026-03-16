import assert from "node:assert/strict";
import test from "node:test";

import { adminProductSchema } from "@/validators/adminProductValidators";

const baseProduct = {
  name: "Hydrating Serum",
  description: "Lightweight serum for daily hydration.",
  priceCents: 2290,
  stock: 10,
  currency: "EUR",
  imageUrl: "https://example.com/product.jpg",
  categoryId: "cat_1",
};

test("adminProductSchema requires featuredRank when product is featured", () => {
  assert.throws(
    () =>
      adminProductSchema.parse({
        ...baseProduct,
        isFeatured: true,
        featuredRank: null,
      }),
    /Featured rank is required when a product is featured/,
  );
});

test("adminProductSchema accepts non-featured products without featuredRank", () => {
  const parsed = adminProductSchema.parse({
    ...baseProduct,
    isFeatured: false,
    featuredRank: null,
  });

  assert.equal(parsed.isFeatured, false);
  assert.equal(parsed.featuredRank, null);
});
