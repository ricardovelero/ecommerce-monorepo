DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Category'
      AND column_name = 'updatedAt'
  ) THEN
    ALTER TABLE "Category" ALTER COLUMN "updatedAt" DROP DEFAULT;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Product'
      AND column_name = 'updatedAt'
  ) THEN
    ALTER TABLE "Product" ALTER COLUMN "updatedAt" DROP DEFAULT;
  END IF;
END
$$;
