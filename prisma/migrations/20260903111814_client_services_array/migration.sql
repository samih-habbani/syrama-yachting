ALTER TABLE "client" ADD COLUMN "services" TEXT[] NOT NULL DEFAULT '{}';
UPDATE "client" SET "services" = ARRAY["service"] WHERE "service" IS NOT NULL AND "service" != '';
ALTER TABLE "client" DROP COLUMN "service";
