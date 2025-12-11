# Setup Guide

This guide will help you set up the Online Nursery Ecommerce Website project.

## Prerequisites

- Node.js 20+
- npm 10+
- A Supabase account and project

## Step 1: Clone the Repository

```bash
git clone https://github.com/Dunamis-Labs/nursery.git
cd nursery
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Set Up Supabase

1. Create a new Supabase project at https://supabase.com
2. Go to Project Settings > Database
3. Copy the connection strings

## Step 4: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Supabase credentials in `.env`:
   ```env
   # REQUIRED: Use POSTGRES_PRISMA_URL for Prisma (direct connection)
   # Copy this value from your Supabase project settings > Database > Connection string
   DATABASE_URL="your-postgres-prisma-url-from-supabase"
   
   # Optional: For connection pooling (uncomment if needed)
   # POSTGRES_URL_NON_POOLING="your-postgres-url-non-pooling-from-supabase"
   
   # Supabase client-side (public - safe to expose in browser)
   NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="your-publishable-key"
   
   # Supabase server-side (private - keep secret)
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   
   # Generate a secure API key for agent access
   ADMIN_API_KEY="$(openssl rand -hex 32)"
   
   # Generate a secure cron secret
   CRON_SECRET="$(openssl rand -hex 32)"
   ```

   **Important:** You must set `DATABASE_URL` before running migrations. Copy the `POSTGRES_PRISMA_URL` value from your Supabase project settings.

## Step 5: Generate Prisma Client

```bash
npm run db:generate
```

This generates the Prisma client with TypeScript types based on your schema.

## Step 6: Run Database Migrations

```bash
npm run db:migrate
```

This creates all the database tables defined in `packages/db/prisma/schema.prisma`.

## Step 7: Start Development Server

```bash
npm run dev
```

The application will be available at http://localhost:3000

## Step 8: Set Up Vercel Environment Variables

1. Go to your Vercel project settings
2. Navigate to Environment Variables
3. Add all the variables from your `.env` file:
   - `DATABASE_URL` (use `POSTGRES_PRISMA_URL` from Supabase)
   - `ADMIN_API_KEY`
   - `CRON_SECRET`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (for server-side operations)
   - And any other variables you need

## Step 9: Set Up GitHub Secrets (for CI/CD)

Go to your GitHub repository settings > Secrets and variables > Actions, and add:

- `DATABASE_URL` - For running migrations in CI
- `VERCEL_TOKEN` - For deployment
- `VERCEL_ORG_ID` - Your Vercel organization ID
- `VERCEL_PROJECT_ID` - Your Vercel project ID

## Verification

1. **Health Check**: Visit http://localhost:3000/api/health
   - Should return: `{"status":"ok","timestamp":"...","service":"nursery-api"}`

2. **Database Connection**: Run `npm run db:studio` to open Prisma Studio and verify tables are created

3. **Type Checking**: Run `npm run type-check` to ensure no TypeScript errors

## Troubleshooting

### Prisma Client Not Generated
If you see errors about missing Prisma types:
```bash
npm run db:generate
```

### Database Connection Issues
- Verify your `DATABASE_URL` is correct
- Check that your Supabase project is active
- Ensure you're using `POSTGRES_PRISMA_URL` (direct connection) not the pooled URL

### TypeScript Errors
- Make sure you've run `npm run db:generate` first
- Run `npm install` to ensure all dependencies are installed

## Next Steps

Once setup is complete, you can:
1. Start building product pages
2. Set up the scraping infrastructure
3. Begin content generation workflows
4. Configure analytics and experimentation tools

See `docs/prd.md` for the complete product requirements and `docs/architecture.md` for technical details.

