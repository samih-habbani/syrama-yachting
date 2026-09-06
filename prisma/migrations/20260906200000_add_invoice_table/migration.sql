-- CreateTable
CREATE TABLE "invoice" (
    "id" SERIAL NOT NULL,
    "reservation_id" INTEGER,
    "provider_id" INTEGER,
    "customer_id" INTEGER,
    "invoice_number" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "service_title" TEXT,
    "service_city" TEXT,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "price_total" DOUBLE PRECISION,
    "commission_rate" DOUBLE PRECISION,
    "commission_amount" DOUBLE PRECISION,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" TEXT NOT NULL,
    "apply_vat" BOOLEAN NOT NULL DEFAULT false,
    "vat_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "invoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invoice_invoice_number_key" ON "invoice"("invoice_number");

-- CreateIndex
CREATE INDEX "invoice_reservation_id_idx" ON "invoice"("reservation_id");

-- Import legacy invoices (from the old MySQL `invoice` table dump)
INSERT INTO "invoice" ("id", "reservation_id", "provider_id", "customer_id", "invoice_number", "type", "service_title", "service_city", "start_date", "end_date", "price_total", "commission_rate", "commission_amount", "currency", "status", "notes", "created_at", "category", "apply_vat", "vat_rate") VALUES
(1, 12, NULL, NULL, 'INV-261', 'yacht', 'Referral fee', NULL, NULL, NULL, NULL, NULL, 122, 'EUR', 'sent', NULL, '2026-07-09 22:54:42', 'commission', false, 0),
(2, 13, NULL, NULL, 'INV-262', 'yacht', 'Referral fee', NULL, NULL, NULL, NULL, NULL, 217, 'EUR', 'sent', NULL, '2026-07-09 22:56:30', 'commission', false, 0),
(3, 107, NULL, NULL, 'INV-263', 'yacht', 'Referral fee', NULL, NULL, NULL, NULL, NULL, 500, 'EUR', 'sent', NULL, '2026-07-21 07:45:28', 'commission', false, 0),
(4, 109, NULL, 52, 'INV-264', 'other', 'Private driver', 'Dubai', '2026-07-23', '2026-07-23', 1800, NULL, NULL, 'EUR', 'draft', NULL, '2026-07-22 19:26:56', 'service', false, 0),
(5, 109, NULL, 52, 'INV-265', 'other', 'Provision of a private chauffeur service with a 2026 GMC vehicle for three (3) passengers in Dubai on 22 July 2026.', 'Dubai', '2026-07-23', '2026-07-23', 1800, NULL, NULL, 'AED', 'sent', 'Provision of a private chauffeur service with a 2026 GMC vehicle for three (3) passengers in Dubai on 22 July 2026.', '2026-07-22 19:44:01', 'service', true, 5),
(6, 110, NULL, NULL, 'INV-266', 'yacht', 'Referral fee', NULL, NULL, NULL, 5500, NULL, 500, 'EUR', 'sent', NULL, '2026-07-24 09:32:13', 'commission', false, 5),
(7, 196, NULL, NULL, 'INV-267', 'yacht', 'Referral fee', NULL, NULL, NULL, 1100, NULL, 120, 'EUR', 'sent', E'Avance paiement Capelli 550€\r\nCommission sur location 120€', '2026-08-08 20:12:03', 'commission', false, 5),
(8, 199, NULL, NULL, 'INV-268', 'yacht', 'Referral fee', NULL, NULL, NULL, 2450, NULL, 150, 'EUR', 'sent', NULL, '2026-08-16 10:09:11', 'commission', false, 5),
(9, 201, NULL, NULL, 'INV-269', 'yacht', 'Referral fee', NULL, NULL, NULL, 6000, NULL, 240, 'EUR', 'sent', NULL, '2026-08-16 10:16:33', 'commission', false, 5),
(10, 206, NULL, NULL, 'INV-2610', 'yacht', 'Referral fee', NULL, NULL, NULL, 5200, NULL, 350, 'EUR', 'sent', NULL, '2026-09-03 09:25:55', 'commission', false, 5);

-- Continue the id sequence from the legacy AUTO_INCREMENT=11, so the next
-- invoice created from the app gets id 11 / "INV-2611".
SELECT setval(pg_get_serial_sequence('"invoice"', 'id'), 10, true);
