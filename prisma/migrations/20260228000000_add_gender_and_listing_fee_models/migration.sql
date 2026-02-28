-- CreateEnum
CREATE TYPE "UserGender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "HostelListingFeeModel" AS ENUM ('STANDARD', 'MONTHLY_LISTING', 'REVENUE_SHARE', 'PER_ACCEPTANCE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "gender" "UserGender";

-- AlterTable
ALTER TABLE "Hostel" ADD COLUMN "listingFeeModel" "HostelListingFeeModel" NOT NULL DEFAULT 'STANDARD',
ADD COLUMN "monthlyListingFee" INTEGER,
ADD COLUMN "revenueSharePercentage" DOUBLE PRECISION,
ADD COLUMN "perAcceptanceFee" INTEGER;
