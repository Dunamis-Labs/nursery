-- Migration: Migrate from custom User model to Supabase Auth with UserProfile
-- Run this in your Supabase SQL Editor

BEGIN;

-- Step 1: Create UserProfile table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS "UserProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "phoneCountryCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Create index on email
CREATE INDEX IF NOT EXISTS "UserProfile_email_idx" ON "UserProfile"("email");

-- Step 3: Migrate data from User table to UserProfile (if User table exists)
-- This handles the case where you have existing users
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'User') THEN
        -- Migrate existing user data to UserProfile
        INSERT INTO "UserProfile" ("id", "email", "firstName", "lastName", "phone", "phoneCountryCode", "createdAt", "updatedAt")
        SELECT 
            "id",
            "email",
            "firstName",
            "lastName",
            "phone",
            "phoneCountryCode",
            "createdAt",
            "updatedAt"
        FROM "User"
        ON CONFLICT ("id") DO NOTHING;
        
        RAISE NOTICE 'Migrated data from User table to UserProfile';
    ELSE
        RAISE NOTICE 'No User table found - skipping data migration';
    END IF;
END $$;

-- Step 4: Create StockNotification table if it doesn't exist
CREATE TABLE IF NOT EXISTS "StockNotification" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "notified" BOOLEAN NOT NULL DEFAULT false,
    "notifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StockNotification_userId_productId_key" UNIQUE ("userId", "productId")
);

-- Step 5: Create indexes for StockNotification
CREATE INDEX IF NOT EXISTS "StockNotification_userId_idx" ON "StockNotification"("userId");
CREATE INDEX IF NOT EXISTS "StockNotification_productId_idx" ON "StockNotification"("productId");
CREATE INDEX IF NOT EXISTS "StockNotification_notified_idx" ON "StockNotification"("notified");

-- Step 6: Update StockNotification table foreign keys
-- Drop old foreign key constraint if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'StockNotification_userId_fkey'
        AND table_name = 'StockNotification'
    ) THEN
        ALTER TABLE "StockNotification" DROP CONSTRAINT "StockNotification_userId_fkey";
        RAISE NOTICE 'Dropped old foreign key constraint';
    END IF;
END $$;

-- Add foreign key to UserProfile
ALTER TABLE "StockNotification" 
    DROP CONSTRAINT IF EXISTS "StockNotification_userId_fkey",
    ADD CONSTRAINT "StockNotification_userId_fkey" 
        FOREIGN KEY ("userId") 
        REFERENCES "UserProfile"("id") 
        ON DELETE CASCADE 
        ON UPDATE CASCADE;

-- Add foreign key to Product (if Product table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Product') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'StockNotification_productId_fkey'
            AND table_name = 'StockNotification'
        ) THEN
            ALTER TABLE "StockNotification" 
                ADD CONSTRAINT "StockNotification_productId_fkey" 
                    FOREIGN KEY ("productId") 
                    REFERENCES "Product"("id") 
                    ON DELETE CASCADE 
                    ON UPDATE CASCADE;
            RAISE NOTICE 'Added foreign key to Product';
        END IF;
    END IF;
END $$;

-- Step 6: Drop the old User table if it exists (after migration is complete)
-- Uncomment the following lines after verifying the migration worked:
-- DROP TABLE IF EXISTS "User" CASCADE;

COMMIT;

-- Verification queries (run these to check the migration):
-- SELECT COUNT(*) as user_count FROM "UserProfile";
-- SELECT COUNT(*) as notification_count FROM "StockNotification";
-- SELECT * FROM "StockNotification" LIMIT 5;

