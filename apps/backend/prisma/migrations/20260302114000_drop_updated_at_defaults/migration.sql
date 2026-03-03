-- Align updatedAt defaults with Prisma @updatedAt semantics.
ALTER TABLE "Category" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "Product" ALTER COLUMN "updatedAt" DROP DEFAULT;
