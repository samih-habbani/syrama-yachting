-- CreateIndex
CREATE INDEX "provider_type_idx" ON "provider"("type");

-- CreateIndex
CREATE INDEX "provider_region_idx" ON "provider"("region");

-- CreateIndex
CREATE INDEX "provider_city_idx" ON "provider"("city");

-- CreateIndex
CREATE INDEX "provider_country_idx" ON "provider"("country");

-- CreateIndex
CREATE INDEX "provider_services_idx" ON "provider" USING GIN ("services");
