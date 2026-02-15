/*
  Warnings:

  - Added the required column `availableSlots` to the `Room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roomConfiguration` to the `Room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalSlots` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RoomGender" AS ENUM ('MALE', 'FEMALE', 'MIXED');

-- CreateEnum
CREATE TYPE "HostelBookingStatus" AS ENUM ('OPEN', 'LIMITED', 'CLOSED', 'FULL');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "autoReleaseAt" TIMESTAMP(3),
ADD COLUMN     "deletionReason" TEXT,
ADD COLUMN     "deletionRequested" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paymentDeadline" TIMESTAMP(3),
ADD COLUMN     "slotNumber" INTEGER;

-- AlterTable
ALTER TABLE "Hostel" ADD COLUMN     "bookingStatus" "HostelBookingStatus" NOT NULL DEFAULT 'OPEN',
ADD COLUMN     "distanceToCampus" TEXT,
ADD COLUMN     "utilitiesIncluded" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "whatsappNumber" TEXT;

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "availableSlots" INTEGER NOT NULL,
ADD COLUMN     "gender" "RoomGender" NOT NULL DEFAULT 'MIXED',
ADD COLUMN     "hasAC" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "roomConfiguration" TEXT NOT NULL,
ADD COLUMN     "totalSlots" INTEGER NOT NULL,
ADD COLUMN     "utilitiesIncluded" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isOnboarded" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "Booking_autoReleaseAt_idx" ON "Booking"("autoReleaseAt");

-- CreateIndex
CREATE INDEX "Room_gender_idx" ON "Room"("gender");
