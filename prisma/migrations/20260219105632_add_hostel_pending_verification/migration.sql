-- AlterEnum
ALTER TYPE "PaymentProvider" ADD VALUE 'OFFLINE';

-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'AWAITING_VERIFICATION';

-- AlterTable
ALTER TABLE "Hostel" ADD COLUMN     "pendingVerification" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "offlineProofUrl" TEXT;
