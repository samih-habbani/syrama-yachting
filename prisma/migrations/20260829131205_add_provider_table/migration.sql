-- CreateTable
CREATE TABLE "provider" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "company" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "city" TEXT,
    "country" TEXT,
    "type" TEXT,
    "services" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "description" TEXT,
    "is_active" BOOLEAN,
    "website" TEXT,
    "instagram" TEXT,
    "notes" TEXT,
    "position" TEXT,
    "first_contact" TEXT,
    "first_name" TEXT,
    "region" TEXT,
    "updated_at" TIMESTAMP(3),
    "manager" TEXT,
    "address" TEXT,
    "postal_code" TEXT,

    CONSTRAINT "provider_pkey" PRIMARY KEY ("id")
);
