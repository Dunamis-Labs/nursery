# Product Data Example

This document shows an example of the data structure we extract from Plantmark and store in our database.

## Raw Scraped Data (PlantmarkProduct)

When we scrape a product from Plantmark's Plant Finder page, we get data in this format:

```json
{
  "id": "6697",
  "name": "Abelia floribunda",
  "sourceId": "6697",
  "sourceUrl": "https://www.plantmark.com.au/abelia-floribunda",
  "description": "Abelia floribunda\n                            \n\n\n\n                        \n                            Abeflo\n\n                            Mexican Abelia",
  "imageUrl": "https://www.plantmark.com.au/images/thumbs/default-image_400.png"
}
```

## Detailed Product Data (from product detail page)

When we scrape the full product detail page, we get more complete information:

```json
{
  "id": "6697",
  "name": "Abelia floribunda",
  "slug": "abelia-floribunda",
  "description": "Full product description text...",
  "botanicalName": "Abelia floribunda",
  "commonName": "Mexican Abelia",
  "price": 24.95,
  "availability": "IN_STOCK",
  "category": "Shrubs",
  "categoryPath": ["Plants", "Shrubs"],
  "imageUrl": "https://www.plantmark.com.au/images/thumbs/0251830_logo_400.png",
  "images": [
    "https://www.plantmark.com.au/images/thumbs/0251830_logo_400.png",
    "https://www.plantmark.com.au/images/thumbs/0251860_web thin banner 1820x215 v1 (1).png",
    "https://www.plantmark.com.au/images/thumbs/default-image_750.png"
  ],
  "sourceUrl": "https://www.plantmark.com.au/abelia-floribunda",
  "sourceId": "6697",
  "metadata": {
    "scrapedAt": "2025-12-11T19:35:00.000Z",
    "location": "Sydney",
    "availability": "Available"
  }
}
```

## Database Schema (Product Model)

When stored in the database, the data is mapped to our Prisma schema:

```typescript
{
  id: "uuid-generated-id",              // Auto-generated UUID
  name: "Abelia floribunda",            // Required
  slug: "abelia-floribunda",            // Auto-generated from name, unique
  description: "Full product description...", // Optional, Text field
  productType: "PHYSICAL",               // Enum: DIGITAL, DROPSHIPPED, PHYSICAL, BUNDLE
  price: 24.95,                          // Decimal(10, 2), defaults to 0
  availability: "IN_STOCK",              // Enum: IN_STOCK, OUT_OF_STOCK, PRE_ORDER, DISCONTINUED
  categoryId: "category-uuid",          // Foreign key to Category
  source: "SCRAPED",                     // Enum: SCRAPED, MANUAL, API
  sourceId: "6697",                      // External ID from Plantmark
  sourceUrl: "https://www.plantmark.com.au/abelia-floribunda",
  botanicalName: "Abelia floribunda",   // Optional
  commonName: "Mexican Abelia",          // Optional
  imageUrl: "https://...",               // Primary image URL
  images: [                              // JSON array of image URLs
    "https://www.plantmark.com.au/images/thumbs/0251830_logo_400.png",
    "https://www.plantmark.com.au/images/thumbs/0251860_web thin banner 1820x215 v1 (1).png"
  ],
  metadata: {                            // JSON object for additional data
    "scrapedAt": "2025-12-11T19:35:00.000Z",
    "location": "Sydney",
    "availability": "Available"
  },
  createdAt: "2025-12-11T19:35:00.000Z",
  updatedAt: "2025-12-11T19:35:00.000Z"
}
```

## Data Fields Explained

### Required Fields
- **id**: Auto-generated UUID
- **name**: Product name (from Plantmark)
- **slug**: URL-friendly version of name (auto-generated)
- **productType**: Always "PHYSICAL" for Plantmark products
- **price**: Product price (defaults to 0 if not found)
- **availability**: Stock status (defaults to "IN_STOCK")
- **categoryId**: Links to a Category record

### Optional Fields
- **description**: Full product description
- **botanicalName**: Scientific/botanical name
- **commonName**: Common name for the plant
- **imageUrl**: Primary product image
- **images**: Array of all product images
- **metadata**: Additional structured data (JSON)
- **sourceId**: External ID from Plantmark
- **sourceUrl**: Link back to Plantmark product page

### Source Information
- **source**: How the product was added ("SCRAPED" for Plantmark imports)
- **sourceId**: Plantmark's internal product ID
- **sourceUrl**: Direct link to product on Plantmark

## Example API Response

When fetched via our API (`GET /api/products/{id}`), the response includes:

```json
{
  "id": "uuid-generated-id",
  "name": "Abelia floribunda",
  "slug": "abelia-floribunda",
  "description": "Full product description...",
  "price": "24.95",
  "availability": "IN_STOCK",
  "botanicalName": "Abelia floribunda",
  "commonName": "Mexican Abelia",
  "imageUrl": "https://www.plantmark.com.au/images/thumbs/0251830_logo_400.png",
  "images": [
    "https://www.plantmark.com.au/images/thumbs/0251830_logo_400.png",
    "https://www.plantmark.com.au/images/thumbs/0251860_web thin banner 1820x215 v1 (1).png"
  ],
  "sourceUrl": "https://www.plantmark.com.au/abelia-floribunda",
  "category": {
    "id": "category-uuid",
    "name": "Shrubs",
    "slug": "shrubs"
  },
  "createdAt": "2025-12-11T19:35:00.000Z",
  "updatedAt": "2025-12-11T19:35:00.000Z"
}
```

## Data Extraction Process

1. **List Scraping**: We scrape the Plant Finder page to get basic product info (name, URL, image)
2. **Detail Scraping**: For each product, we visit the detail page to get full information
3. **Normalization**: Data is validated and normalized before storage
4. **Storage**: Products are stored in PostgreSQL via Prisma ORM
5. **Updates**: Existing products are updated if data has changed, skipped if identical

## Running the Example Script

To see a live example of scraped data:

```bash
npm run tsx scripts/show-product-example.ts
```

This will:
1. Scrape the first product from Plantmark's Plant Finder
2. Display the raw data structure
3. Fetch detailed information from the product page
4. Show the complete data structure

