/*
  Warnings:

  - The values [PENDING_APPROVAL,APPROVED,REJECTED,CONFIRMED,EXPIRED,CHECKED_OUT] on the enum `BookingStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `listingFeeModel` on the `Hostel` table. All the data in the column will be lost.
  - You are about to drop the column `monthlyListingFee` on the `Hostel` table. All the data in the column will be lost.
  - You are about to drop the column `perAcceptanceFee` on the `Hostel` table. All the data in the column will be lost.
  - You are about to drop the column `revenueSharePercentage` on the `Hostel` table. All the data in the column will be lost.
  - You are about to drop the column `active` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `plan` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `paystackSubaccountCode` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `PayoutMethod` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PayoutRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SavedPaymentMethod` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Wallet` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[paymentReference]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `planId` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CARD', 'BANK_TRANSFER', 'USSD', 'MOBILE_MONEY');

-- CreateEnum
CREATE TYPE "FacilityType" AS ENUM ('FREE', 'PAID');

-- CreateEnum
CREATE TYPE "RoomStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'OCCUPIED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELED', 'PENDING');

-- AlterEnum
BEGIN;
CREATE TYPE "BookingStatus_new" AS ENUM ('PENDING', 'PAYMENT_SECURED', 'RESERVED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED', 'DISPUTED');
ALTER TABLE "public"."Booking" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Booking" ALTER COLUMN "status" TYPE "BookingStatus_new" USING ("status"::text::"BookingStatus_new");
ALTER TYPE "BookingStatus" RENAME TO "BookingStatus_old";
ALTER TYPE "BookingStatus_new" RENAME TO "BookingStatus";
DROP TYPE "public"."BookingStatus_old";
ALTER TABLE "Booking" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- DropForeignKey
ALTER TABLE "AdminAuditLog" DROP CONSTRAINT "AdminAuditLog_adminId_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Hostel" DROP CONSTRAINT "Hostel_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "PayoutMethod" DROP CONSTRAINT "PayoutMethod_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "PayoutRequest" DROP CONSTRAINT "PayoutRequest_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "SavedPaymentMethod" DROP CONSTRAINT "SavedPaymentMethod_userId_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "Wallet" DROP CONSTRAINT "Wallet_hostelId_fkey";

-- DropForeignKey
ALTER TABLE "Wallet" DROP CONSTRAINT "Wallet_ownerId_fkey";

-- AlterTable
ALTER TABLE "AdminAuditLog" ALTER COLUMN "adminId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "admissionDocUrl" TEXT,
ADD COLUMN     "guardianName" TEXT,
ADD COLUMN     "guardianPhone" TEXT,
ADD COLUMN     "levelOfStudy" TEXT,
ADD COLUMN     "passportPhotoUrl" TEXT,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Hostel" DROP COLUMN "listingFeeModel",
DROP COLUMN "monthlyListingFee",
DROP COLUMN "perAcceptanceFee",
DROP COLUMN "revenueSharePercentage",
ADD COLUMN     "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "genderCategory" "RoomGender",
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVerifiedHostel" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "policiesText" TEXT,
ADD COLUMN     "totalReviews" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "virtualTourUrl" TEXT;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "accountName" TEXT,
ADD COLUMN     "accountNumber" TEXT,
ADD COLUMN     "bankCode" TEXT,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "method" "PaymentMethod" NOT NULL DEFAULT 'CARD',
ADD COLUMN     "processingFee" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "status" "RoomStatus" NOT NULL DEFAULT 'AVAILABLE';

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "active",
DROP COLUMN "expiresAt",
DROP COLUMN "ownerId",
DROP COLUMN "plan",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "paymentReference" TEXT,
ADD COLUMN     "planId" TEXT NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" "SubscriptionStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "paystackSubaccountCode",
ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "ghanaCardId" TEXT,
ADD COLUMN     "ghanaCardUrl" TEXT,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lookingForRoommate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "middleName" TEXT,
ADD COLUMN     "roommateMatchingPrefs" JSONB;

-- DropTable
DROP TABLE "PayoutMethod";

-- DropTable
DROP TABLE "PayoutRequest";

-- DropTable
DROP TABLE "SavedPaymentMethod";

-- DropTable
DROP TABLE "Wallet";

-- DropEnum
DROP TYPE "HostelListingFeeModel";

-- DropEnum
DROP TYPE "PayoutMethodType";

-- DropEnum
DROP TYPE "PayoutStatus";

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailVerificationToken" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailVerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HostelFacility" (
    "id" TEXT NOT NULL,
    "hostelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "FacilityType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HostelFacility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "monthlyPrice" INTEGER,
    "yearlyPrice" INTEGER,
    "listingLimit" INTEGER,
    "featuredIncluded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "tenantId" TEXT NOT NULL,
    "hostelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "isSupport" BOOLEAN NOT NULL DEFAULT false,
    "guestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT,
    "guestName" TEXT,
    "content" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsletterSubscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsletterSubscriber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hostelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ConversationToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ConversationToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "PasswordResetToken_email_idx" ON "PasswordResetToken"("email");

-- CreateIndex
CREATE INDEX "PasswordResetToken_expiresAt_idx" ON "PasswordResetToken"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerificationToken_token_key" ON "EmailVerificationToken"("token");

-- CreateIndex
CREATE INDEX "EmailVerificationToken_email_idx" ON "EmailVerificationToken"("email");

-- CreateIndex
CREATE INDEX "EmailVerificationToken_expiresAt_idx" ON "EmailVerificationToken"("expiresAt");

-- CreateIndex
CREATE INDEX "HostelFacility_hostelId_idx" ON "HostelFacility"("hostelId");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_code_key" ON "Plan"("code");

-- CreateIndex
CREATE INDEX "Review_hostelId_idx" ON "Review"("hostelId");

-- CreateIndex
CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscriber_email_key" ON "NewsletterSubscriber"("email");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscriber_hash_key" ON "NewsletterSubscriber"("hash");

-- CreateIndex
CREATE INDEX "NewsletterSubscriber_hash_idx" ON "NewsletterSubscriber"("hash");

-- CreateIndex
CREATE INDEX "Favorite_userId_idx" ON "Favorite"("userId");

-- CreateIndex
CREATE INDEX "Favorite_hostelId_idx" ON "Favorite"("hostelId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_hostelId_key" ON "Favorite"("userId", "hostelId");

-- CreateIndex
CREATE INDEX "_ConversationToUser_B_index" ON "_ConversationToUser"("B");

-- CreateIndex
CREATE INDEX "Payment_method_idx" ON "Payment"("method");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_paymentReference_key" ON "Subscription"("paymentReference");

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE INDEX "Subscription_endDate_idx" ON "Subscription"("endDate");

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_email_fkey" FOREIGN KEY ("email") REFERENCES "User"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailVerificationToken" ADD CONSTRAINT "EmailVerificationToken_email_fkey" FOREIGN KEY ("email") REFERENCES "User"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hostel" ADD CONSTRAINT "Hostel_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostelFacility" ADD CONSTRAINT "HostelFacility_hostelId_fkey" FOREIGN KEY ("hostelId") REFERENCES "Hostel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAuditLog" ADD CONSTRAINT "AdminAuditLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_hostelId_fkey" FOREIGN KEY ("hostelId") REFERENCES "Hostel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_hostelId_fkey" FOREIGN KEY ("hostelId") REFERENCES "Hostel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConversationToUser" ADD CONSTRAINT "_ConversationToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConversationToUser" ADD CONSTRAINT "_ConversationToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
