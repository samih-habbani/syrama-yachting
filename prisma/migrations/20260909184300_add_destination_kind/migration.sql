-- Add a "kind" discriminator (charter | sale) to the destination table so
-- the same schema can hold both charter and sale destination pages, and
-- reshape the unique constraint to be scoped by kind (a charter and a sale
-- destination can legitimately share the same region/city, e.g. both have
-- a French Riviera entry).
ALTER TABLE "destination" ADD COLUMN "kind" TEXT NOT NULL DEFAULT 'charter';

DROP INDEX "destination_region_slug_city_slug_key";
CREATE UNIQUE INDEX "destination_kind_region_slug_city_slug_key" ON "destination"("kind", "region_slug", "city_slug");

-- Seed the one sale destination backed by real inventory (all 93 sale
-- yachts are recorded under region/city = "French Riviera"/"French
-- Riviera" — see the groupBy check that led to this scope decision).
INSERT INTO "destination" (
  "kind", "region_slug", "city_slug", "name", "region", "city",
  "title", "meta_description", "h1", "hero_image", "eyebrow", "intro", "related_keys", "updated_at"
) VALUES (
  'sale', 'french-riviera', NULL, 'French Riviera', 'French Riviera', NULL,
  'French Riviera Yachts For Sale | Syrama Yachting',
  'Buy a luxury yacht on the French Riviera with Syrama Yachting. Browse our curated fleet for sale and get expert brokerage support from search to acquisition.',
  'Luxury Yachts For Sale in the French Riviera',
  '/images/regions/French_Riviera.webp',
  'French Riviera',
  ARRAY[
    'From Cannes to Saint-Tropez and Monaco, the French Riviera remains one of the world''s most active markets for yacht ownership — deep-water marinas, established brokerage infrastructure and a full network of surveyors, refit yards and crew agencies all in one coastline.',
    'Syrama Yachting represents buyers through the full acquisition process: sourcing vessels that match your brief, arranging viewings and sea trials, coordinating survey and negotiation, and closing — with the same team available afterward for management, crew or charter income.'
  ]::text[],
  ARRAY[]::text[],
  now()
);

INSERT INTO "destination_faq" ("destination_id", "question", "answer", "position")
SELECT d.id, f.question, f.answer, f.position
FROM "destination" d,
  (VALUES
    ('Can Syrama Yachting help with financing a yacht purchase?', 'We work with a network of marine finance brokers and can introduce you to financing options suited to the vessel and your situation, though financing itself is arranged directly between you and the lender.', 0),
    ('Is a sea trial and survey included when buying through Syrama?', 'Yes — every acquisition includes a sea trial and an independent survey before any offer is finalized, so you have a full technical picture of the yacht before committing.', 1),
    ('What ongoing costs should I expect after buying a yacht here?', 'Berthing, insurance, crew and maintenance are the main recurring costs on the French Riviera. We give every buyer a realistic estimate specific to the yacht and marina before purchase, not after.', 2),
    ('How long does the process take from offer to closing?', 'A typical transaction takes four to eight weeks from accepted offer to closing, depending on survey findings, financing and flag/registration requirements — we coordinate every step so nothing stalls unnecessarily.', 3)
  ) AS f(question, answer, position)
WHERE d.kind = 'sale' AND d.region_slug = 'french-riviera' AND d.city_slug IS NULL;
