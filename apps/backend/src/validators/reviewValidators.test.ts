import assert from "node:assert/strict";
import test from "node:test";

import { ZodError } from "zod";

import { upsertProductReviewSchema } from "@/validators/reviewValidators";

test("upsertProductReviewSchema accepts a valid payload", () => {
  const parsed = upsertProductReviewSchema.parse({
    rating: 5,
    comment: "Excellent product.",
  });

  assert.equal(parsed.rating, 5);
  assert.equal(parsed.comment, "Excellent product.");
});

test("upsertProductReviewSchema rejects invalid rating and comment payloads", () => {
  assert.throws(
    () =>
      upsertProductReviewSchema.parse({
        rating: 0,
        comment: "",
      }),
    (error: unknown) => error instanceof ZodError,
  );
});
