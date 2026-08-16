-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "yacht_status_idx" ON "yacht"("status");

-- CreateIndex
CREATE INDEX "yacht_length_idx" ON "yacht"("length");

-- CreateIndex
CREATE INDEX "yacht_region_idx" ON "yacht"("region");

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_yacht_id_fkey" FOREIGN KEY ("yacht_id") REFERENCES "yacht"("id") ON DELETE SET NULL ON UPDATE CASCADE;
