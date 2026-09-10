-- New yachting_blog_post table backing /blog and /blog/[slug] — SEO
-- cluster content linking back up to the /yacht-charter and /yacht-sale
-- pillar pages. Deliberately NOT named "blog_post": that table already
-- exists in this database (a different Syrama Services property's blog,
-- unrelated to this codebase — see the comment on YachtingBlogPost in
-- schema.prisma) and must not be touched.
--
-- Content is stored as an ordered JSON array of typed blocks (heading /
-- paragraph / list / quote), not markdown or HTML, matching the rest of
-- this schema's convention for structured rich content (see
-- Destination.intro, destination_faq).
CREATE TABLE "yachting_blog_post" (
  "id" SERIAL NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "meta_title" TEXT,
  "meta_description" TEXT NOT NULL,
  "excerpt" TEXT NOT NULL,
  "content" JSONB NOT NULL,
  "cover_image" TEXT NOT NULL,
  "cover_image_alt" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "status" TEXT NOT NULL DEFAULT 'draft',
  "published_at" TIMESTAMP(3),
  "reading_minutes" INTEGER NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "yachting_blog_post_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "yachting_blog_post_slug_key" ON "yachting_blog_post"("slug");
CREATE INDEX "yachting_blog_post_status_idx" ON "yachting_blog_post"("status");
CREATE INDEX "yachting_blog_post_published_at_idx" ON "yachting_blog_post"("published_at");
CREATE INDEX "yachting_blog_post_category_idx" ON "yachting_blog_post"("category");
