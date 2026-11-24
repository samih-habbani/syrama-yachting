-- Client quotes (devis) generated from a reservation, with free-form line
-- items, and the same line items carried onto the invoice.
CREATE TABLE "quote" (
  "id" SERIAL NOT NULL,
  "reservation_id" INTEGER NOT NULL,
  "quote_number" TEXT NOT NULL,
  "currency" TEXT NOT NULL,
  "items" JSONB NOT NULL,
  "apply_vat" BOOLEAN NOT NULL DEFAULT false,
  "vat_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "valid_until" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'draft',
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "quote_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "quote_quote_number_key" ON "quote"("quote_number");
CREATE INDEX "quote_reservation_id_idx" ON "quote"("reservation_id");

ALTER TABLE "invoice" ADD COLUMN "items" JSONB;
ALTER TABLE "invoice" ADD COLUMN "quote_id" INTEGER;
