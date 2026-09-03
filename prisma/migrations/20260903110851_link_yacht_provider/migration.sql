CREATE INDEX "yacht_provider_id_idx" ON "yacht"("provider_id");
ALTER TABLE "yacht" ADD CONSTRAINT "yacht_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;
