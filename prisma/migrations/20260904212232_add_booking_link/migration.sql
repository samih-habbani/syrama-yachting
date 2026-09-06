CREATE TABLE "booking_link" (
  "id" SERIAL PRIMARY KEY,
  "token" TEXT NOT NULL UNIQUE,
  "yacht_id" INTEGER NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "start_time" TEXT NOT NULL,
  "end_time" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "reservation_id" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "booking_link_yacht_id_fkey" FOREIGN KEY ("yacht_id") REFERENCES "yacht"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "booking_link_yacht_id_idx" ON "booking_link"("yacht_id");
