/*
  Warnings:

  - Added the required column `short_desc` to the `places` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SuggestionStatus" AS ENUM ('NEW', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "eyebrow" TEXT,
ADD COLUMN     "icon_bg" TEXT,
ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "subtitle" TEXT;

-- AlterTable
ALTER TABLE "places" ADD COLUMN     "district" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "facebook" TEXT,
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "instagram" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "short_desc" TEXT NOT NULL,
ADD COLUMN     "show_contacts" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "show_discount" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "subcategory" TEXT,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "website" TEXT;

-- CreateTable
CREATE TABLE "suggestions" (
    "id" UUID NOT NULL,
    "place_name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "photo_url" TEXT,
    "contact_name" TEXT NOT NULL,
    "contact_email" TEXT NOT NULL,
    "status" "SuggestionStatus" NOT NULL DEFAULT 'NEW',
    "result_place_id" UUID,
    "review_note" TEXT,
    "reviewed_by" UUID,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "suggestions_status_idx" ON "suggestions"("status");

-- CreateIndex
CREATE INDEX "suggestions_created_at_idx" ON "suggestions"("created_at");

-- CreateIndex
CREATE INDEX "places_featured_idx" ON "places"("featured");

-- AddForeignKey
ALTER TABLE "suggestions" ADD CONSTRAINT "suggestions_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suggestions" ADD CONSTRAINT "suggestions_result_place_id_fkey" FOREIGN KEY ("result_place_id") REFERENCES "places"("id") ON DELETE SET NULL ON UPDATE CASCADE;
