CREATE TABLE "contract" (
  "id" SERIAL PRIMARY KEY,
  "reservation_id" INTEGER NOT NULL UNIQUE,
  "booking_reference" TEXT NOT NULL UNIQUE,
  "status" TEXT NOT NULL DEFAULT 'waiting_for_payment',
  "client_full_name" TEXT NOT NULL,
  "client_email" TEXT NOT NULL,
  "client_phone" TEXT NOT NULL,
  "client_country" TEXT,
  "yacht_model" TEXT NOT NULL,
  "yacht_operator" TEXT,
  "experience_date" TIMESTAMP(3) NOT NULL,
  "experience_end_date" TIMESTAMP(3),
  "start_time" TEXT,
  "end_time" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3),
  CONSTRAINT "contract_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
