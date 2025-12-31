-- Add navigation tagline, hero subheading, and about paragraph to category content

ALTER TABLE "CategoryContent"
ADD COLUMN IF NOT EXISTS "navTagline" VARCHAR(64),
ADD COLUMN IF NOT EXISTS "heroSubheading" VARCHAR(200),
ADD COLUMN IF NOT EXISTS "aboutParagraph" TEXT;





