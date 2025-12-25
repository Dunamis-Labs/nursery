-- AlterTable
ALTER TABLE "ProductContent" ADD COLUMN "idealFor" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "notIdealFor" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "ProductSpecification" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "lightRequirements" TEXT,
    "humidity" TEXT,
    "growthRate" TEXT,
    "toxicity" TEXT,
    "watering" TEXT,
    "temperature" TEXT,
    "difficulty" TEXT,
    "origin" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductSpecification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductSpecification_productId_key" ON "ProductSpecification"("productId");

-- CreateIndex
CREATE INDEX "ProductSpecification_productId_idx" ON "ProductSpecification"("productId");

-- CreateIndex
CREATE INDEX "ProductSpecification_lightRequirements_idx" ON "ProductSpecification"("lightRequirements");

-- CreateIndex
CREATE INDEX "ProductSpecification_humidity_idx" ON "ProductSpecification"("humidity");

-- CreateIndex
CREATE INDEX "ProductSpecification_growthRate_idx" ON "ProductSpecification"("growthRate");

-- CreateIndex
CREATE INDEX "ProductSpecification_toxicity_idx" ON "ProductSpecification"("toxicity");

-- CreateIndex
CREATE INDEX "ProductSpecification_difficulty_idx" ON "ProductSpecification"("difficulty");

-- AddForeignKey
ALTER TABLE "ProductSpecification" ADD CONSTRAINT "ProductSpecification_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

