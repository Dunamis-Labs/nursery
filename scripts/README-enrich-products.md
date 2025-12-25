# Product Enrichment Script

This script enriches all products in the database using AI (OpenAI ChatGPT or Anthropic Claude) to generate comprehensive product information.

## What It Does

For each product, the script uses AI to:

1. **Find Common Name**: Identifies the most commonly used name for the plant
2. **Generate "Ideal For" List**: Creates up to 6 items describing who the plant is ideal for
3. **Generate "Not Ideal For" List**: Creates up to 6 items describing who the plant is NOT ideal for (total max 12 items)
4. **Write SEO-Optimized Description**: Creates a high-quality, multi-paragraph description optimized for ChatGPT and search engines
5. **Generate Specifications**: Creates detailed specifications including:
   - Light requirements
   - Humidity
   - Growth rate
   - Toxicity
   - Watering needs
   - Temperature range
   - Difficulty level
   - Origin
6. **Write Care Instructions**: Detailed, SEO-optimized care instructions
7. **Generate FAQs**: Creates at least 5 frequently asked questions with detailed answers

## Setup

### 1. Add API Key to .env

**Option A: Use OpenAI ChatGPT (Recommended if you have Pro subscription)**

Add your OpenAI API key to your root `.env` file:

```bash
OPENAI_API_KEY=your-openai-api-key-here
```

To get your OpenAI API key:
1. Go to https://platform.openai.com/api-keys
2. Sign in with your OpenAI account (Pro subscription)
3. Create a new API key or copy an existing one
4. Add it to the root `.env` file

**Option B: Use Anthropic Claude**

Add your Anthropic API key from Cursor Settings to your root `.env` file:

```bash
ANTHROPIC_API_KEY=your-api-key-here
USE_CLAUDE=true
```

To get your API key:
1. Open Cursor Settings
2. Go to Models > Anthropic API Key
3. Copy your API key
4. Add it to the root `.env` file

### 2. Run Database Migration

The script requires new database fields. Run the migration:

```bash
npm run db:migrate
```

This will:
- Add `idealFor` and `notIdealFor` arrays to `ProductContent`
- Create the new `ProductSpecification` model with all specification fields

### 3. Generate Prisma Client

After migration, regenerate the Prisma client:

```bash
npm run db:generate
```

## Usage

Run the wrapper script (it will automatically use OpenAI or Claude based on your .env):

```bash
npx tsx scripts/enrich-products-wrapper.ts
```

Or run directly:

**Using OpenAI (default):**
```bash
npx tsx scripts/enrich-products-with-openai.ts
```

**Using Anthropic Claude:**
```bash
npx tsx scripts/enrich-products-with-claude.ts
```

**Test mode (process only 1 product):**
```bash
TEST_MODE=true npx tsx scripts/enrich-products-wrapper.ts
```

## How It Works

1. **Fetches All Products**: Retrieves all products from the database with their category information
2. **Processes One by One**: Iterates through each product sequentially
3. **Calls AI API**: Sends product information to OpenAI ChatGPT or Anthropic Claude API with a detailed prompt
4. **Saves After Each Product**: Immediately saves the enriched data to prevent data loss
5. **Handles Errors**: Retries on rate limits (with exponential backoff) and logs errors
6. **Shows Progress**: Displays progress percentage and status for each product

## Features

- ✅ **Rate Limit Handling**: Automatically retries on 429 errors with exponential backoff
- ✅ **Progress Tracking**: Shows real-time progress with percentage complete
- ✅ **Error Recovery**: Continues processing even if individual products fail
- ✅ **Data Validation**: Ensures "ideal for" + "not ideal for" never exceeds 12 items total
- ✅ **Atomic Saves**: Each product is saved immediately after enrichment
- ✅ **Comprehensive Logging**: Detailed logs for success, failures, and retries

## Output

The script will:
- Update `Product.commonName` with the common name
- Create/update `ProductContent` with description, care instructions, and ideal/not ideal lists
- Create/update `ProductSpecification` with all specification fields
- Delete old FAQs and create new ones with proper display order

## Database Schema Changes

### ProductContent
- Added `idealFor: String[]` - Array of "ideal for" items
- Added `notIdealFor: String[]` - Array of "not ideal for" items

### ProductSpecification (New Model)
- `lightRequirements: String?`
- `humidity: String?`
- `growthRate: String?`
- `toxicity: String?`
- `watering: String?`
- `temperature: String?`
- `difficulty: String?`
- `origin: String?`

All specification fields are indexed for efficient filtering.

## Notes

- The script processes ALL products, even if they already have content
- Each API call may take 5-10 seconds
- For 1500+ products, expect the script to run for several hours
- The script includes a 500ms delay between products to avoid overwhelming the API
- Failed products are logged at the end with error details

## Troubleshooting

### "OPENAI_API_KEY is not set" or "ANTHROPIC_API_KEY is not set"
- Make sure you've added the appropriate API key to your root `.env` file
- For OpenAI: Use `OPENAI_API_KEY=...`
- For Anthropic: Use `ANTHROPIC_API_KEY=...` and `USE_CLAUDE=true`
- Restart your terminal/IDE after adding the key

### "Environment variable not found: DATABASE_URL"
- Ensure your `.env` file has `DATABASE_URL` set
- Check that you're running from the project root

### Rate Limit Errors
- The script automatically handles rate limits
- If you see many rate limit errors, the script will retry automatically
- Consider running during off-peak hours for faster processing

### Migration Errors
- Make sure you've run `npm run db:generate` after migration
- Check that your database connection is working: `npm run db:studio`

