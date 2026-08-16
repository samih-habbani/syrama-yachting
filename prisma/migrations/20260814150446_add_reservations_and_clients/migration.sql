-- CreateTable
CREATE TABLE "client" (
    "id" SERIAL NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservation" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "yacht_id" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "number_of_people" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reservation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "client_email_key" ON "client"("email");

-- CreateIndex
CREATE INDEX "reservation_client_id_idx" ON "reservation"("client_id");

-- CreateIndex
CREATE INDEX "reservation_yacht_id_idx" ON "reservation"("yacht_id");

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_yacht_id_fkey" FOREIGN KEY ("yacht_id") REFERENCES "yacht"("id") ON DELETE CASCADE ON UPDATE CASCADE;
