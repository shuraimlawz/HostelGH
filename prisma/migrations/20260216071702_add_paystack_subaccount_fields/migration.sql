-- AlterTable
ALTER TABLE "PayoutMethod" ADD COLUMN     "bankCode" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "paystackSubaccountCode" TEXT;
