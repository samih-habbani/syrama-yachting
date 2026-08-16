-- AlterTable
ALTER TABLE "message" ADD COLUMN     "destination" TEXT,
ADD COLUMN     "first_name" TEXT,
ADD COLUMN     "last_name" TEXT,
ADD COLUMN     "number_of_guests" INTEGER,
ADD COLUMN     "preferred_date" TEXT,
ALTER COLUMN "name" DROP NOT NULL;
