-- AlterTable
ALTER TABLE "Hostel" ADD COLUMN     "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "university" TEXT;

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[];
