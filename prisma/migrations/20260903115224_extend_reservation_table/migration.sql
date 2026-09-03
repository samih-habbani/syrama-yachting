ALTER TABLE "reservation" ALTER COLUMN "yacht_id" DROP NOT NULL;
ALTER TABLE "reservation" ALTER COLUMN "date" DROP NOT NULL;
ALTER TABLE "reservation" ALTER COLUMN "number_of_people" DROP NOT NULL;
ALTER TABLE "reservation" ALTER COLUMN "location" DROP NOT NULL;

ALTER TABLE "reservation" ADD COLUMN "end_date" TIMESTAMP(3);
ALTER TABLE "reservation" ADD COLUMN "type" TEXT;
ALTER TABLE "reservation" ADD COLUMN "object_id" INTEGER;
ALTER TABLE "reservation" ADD COLUMN "object_title" TEXT;
ALTER TABLE "reservation" ADD COLUMN "first_name" TEXT;
ALTER TABLE "reservation" ADD COLUMN "last_name" TEXT;
ALTER TABLE "reservation" ADD COLUMN "email" TEXT;
ALTER TABLE "reservation" ADD COLUMN "phone" TEXT;
ALTER TABLE "reservation" ADD COLUMN "message" TEXT;
ALTER TABLE "reservation" ADD COLUMN "image" TEXT;
ALTER TABLE "reservation" ADD COLUMN "provider_id" INTEGER;
ALTER TABLE "reservation" ADD COLUMN "property_id" INTEGER;
ALTER TABLE "reservation" ADD COLUMN "price_total" DOUBLE PRECISION;
ALTER TABLE "reservation" ADD COLUMN "commission_rate" DOUBLE PRECISION;
ALTER TABLE "reservation" ADD COLUMN "currency" TEXT;

ALTER TABLE "reservation" DROP CONSTRAINT "reservation_yacht_id_fkey";
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_yacht_id_fkey" FOREIGN KEY ("yacht_id") REFERENCES "yacht"("id") ON DELETE SET NULL ON UPDATE CASCADE;
