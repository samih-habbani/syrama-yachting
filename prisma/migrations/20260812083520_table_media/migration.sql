-- CreateTable
CREATE TABLE "media" (
    "id" SERIAL NOT NULL,
    "property_id" INTEGER,
    "yacht_id" INTEGER,
    "url" TEXT,
    "alt" TEXT,
    "updated_at" TIMESTAMP(3),
    "luxury_watch_id" INTEGER,
    "leading_yacht_id" INTEGER,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);
