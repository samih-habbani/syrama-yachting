ALTER TABLE "reservation"
  ADD CONSTRAINT "reservation_property_id_fkey"
  FOREIGN KEY ("property_id") REFERENCES "property"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "reservation_property_id_idx" ON "reservation"("property_id");
