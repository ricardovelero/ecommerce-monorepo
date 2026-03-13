-- CreateEnum
CREATE TYPE "FulfillmentStatus" AS ENUM ('UNFULFILLED', 'PROCESSING', 'SHIPPED', 'DELIVERED');

-- AlterTable
ALTER TABLE "Order"
ADD COLUMN "fulfillmentStatus" "FulfillmentStatus" NOT NULL DEFAULT 'UNFULFILLED',
ADD COLUMN "customerName" TEXT,
ADD COLUMN "phone" TEXT,
ADD COLUMN "shippingAddressLine1" TEXT,
ADD COLUMN "shippingAddressLine2" TEXT,
ADD COLUMN "shippingCity" TEXT,
ADD COLUMN "shippingPostalCode" TEXT,
ADD COLUMN "shippingCountry" TEXT,
ADD COLUMN "shippingNotes" TEXT,
ADD COLUMN "trackingNumber" TEXT,
ADD COLUMN "fulfilledAt" TIMESTAMP(3);
