-- AlterEnum
ALTER TYPE "PlaceStatus" ADD VALUE 'DRAFT';

-- AlterTable
ALTER TABLE "places" ADD COLUMN     "youtube_url" TEXT,
ALTER COLUMN "show_contacts" SET DEFAULT false,
ALTER COLUMN "show_discount" SET DEFAULT false;
