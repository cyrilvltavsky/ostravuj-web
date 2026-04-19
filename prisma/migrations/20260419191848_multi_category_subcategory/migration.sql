-- AlterTable
ALTER TABLE "places" ADD COLUMN     "category_slugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "subcategories" TEXT[] DEFAULT ARRAY[]::TEXT[];
