ALTER TABLE "Product"
ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "featuredRank" INTEGER;

CREATE INDEX "Product_isFeatured_featuredRank_idx" ON "Product"("isFeatured", "featuredRank");
