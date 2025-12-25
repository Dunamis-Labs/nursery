-- Add full-text search vector column to Product table
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "searchVector" tsvector;

-- Create function to update product search vector
-- Includes name, commonName, botanicalName, description, and ProductContent fields
CREATE OR REPLACE FUNCTION update_product_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  -- Build search vector from product fields with weights:
  -- A (highest): name, commonName
  -- B (high): botanicalName
  -- C (medium): description
  -- D (low): ProductContent detailedDescription
  NEW."searchVector" := 
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW."commonName", '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW."botanicalName", '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C') ||
    COALESCE(
      (SELECT setweight(to_tsvector('english', COALESCE(pc."detailedDescription", '')), 'D')
       FROM "ProductContent" pc
       WHERE pc."productId" = NEW.id),
      to_tsvector('')
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update search vector on insert/update
DROP TRIGGER IF EXISTS product_search_vector_update ON "Product";
CREATE TRIGGER product_search_vector_update
BEFORE INSERT OR UPDATE ON "Product"
FOR EACH ROW EXECUTE FUNCTION update_product_search_vector();

-- Create GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS "Product_searchVector_idx" 
ON "Product" USING GIN ("searchVector");

-- Update existing products to populate search vector
UPDATE "Product" SET "updatedAt" = "updatedAt";

