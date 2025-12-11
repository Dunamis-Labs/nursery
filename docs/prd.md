# Online Nursery Ecommerce Website Product Requirements Document (PRD)

## Goals and Background Context

### Goals

- **Goal 1:** Outrank daleysfruit.com.au in search results for Australian online nursery-related keywords
- **Goal 2:** Build a strong online presence and SEO foundation for Phase 1 (before accepting orders)
- **Goal 3:** Create an extensive product inventory database optimized for SEO and AI discovery (ChatGPT/Gemini)
- **Goal 4:** Establish infrastructure to receive and process online orders in Phase 2
- **Goal 5:** Scrape and import product inventory from plantmark.com.au (handling international access restrictions)

### Background Context

The Australian online nursery market is competitive, with established players like Daleys Fruit Tree Nursery dominating search results. There's an opportunity to create a new ecommerce platform that:

1. Leverages extensive product inventory from Plantmark (a wholesale nursery supplier) to create a comprehensive catalog
2. Optimizes for modern search discovery, including traditional SEO and AI-powered search engines (ChatGPT, Gemini) that increasingly influence product discovery
3. Builds a strong foundation before launching ecommerce functionality, allowing the site to establish domain authority and search rankings

The project faces a technical challenge: Plantmark blocks international access, requiring a solution to scrape their inventory data. This inventory will form the foundation of thousands of product pages, each optimized for specific search terms relevant to Australian gardeners and plant enthusiasts.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2024-12-19 | 1.0 | Initial PRD creation | BMad Master |

## Requirements

### Functional

**FR1:** The system must scrape product inventory data from plantmark.com.au, including product names, descriptions, images, pricing, availability, and categorization.

**FR2:** The system must handle international access restrictions when scraping plantmark.com.au (e.g., proxy/VPN, Australian IP requirements).

**FR3:** The system must store scraped product data in a structured database with fields for: product name, description, images, price, availability status, category, subcategory, botanical name, common name, and SEO metadata.

**FR4:** The system must generate individual product pages for each inventory item, with unique URLs following SEO-friendly patterns (e.g., `/products/{category}/{product-slug}`).

**FR5:** Each product page must include SEO-optimized content: meta titles, meta descriptions, structured data (Schema.org Product markup), alt text for images, and semantic HTML.

**FR6:** The system must create category and subcategory listing pages that are SEO-optimized and link to related products.

**FR7:** The system must implement a search functionality that allows users to find products by name, botanical name, category, or common name.

**FR8:** The system must support Phase 2 ecommerce functionality: shopping cart, checkout process, order management, and payment processing (to be implemented in Phase 2).

**FR9:** The system must generate and maintain an XML sitemap that includes all product pages, category pages, and other important pages for search engine indexing.

**FR10:** The system must implement breadcrumb navigation on product and category pages for improved SEO and user experience.

**FR11:** The system must support content optimization for AI discovery engines (ChatGPT, Gemini) through structured data, clear semantic markup, and comprehensive product information.

**FR12:** The system must provide API endpoints and agent-accessible interfaces for managing product data, updating inventory, and monitoring scraping operations (no traditional CMS required - all management via Cursor Cloud agents).

**FR13:** The system must generate comprehensive, unique product descriptions for each inventory item, including botanical information, growing requirements, care instructions, ideal growing zones, and companion plant suggestions.

**FR14:** The system must create detailed category and subcategory pages with rich content including growing tips, seasonal advice, and curated product recommendations.

**FR15:** The system must provide API endpoints for creating, updating, and publishing blog posts, guides, and articles (agent-driven, no traditional CMS UI required - target: 2-4 pieces per week via Cursor Cloud agents).

**FR16:** Each product page must include an FAQ section with common questions and detailed answers (e.g., "How often should I water this plant?", "What soil type does this prefer?", "When is the best time to plant?").

**FR17:** The system must generate comparison content (e.g., "X vs Y" comparison pages) for similar products to create additional content opportunities.

**FR18:** The system must support location-specific content pages (e.g., "Best Plants for Sydney", "Drought-Tolerant Plants for Melbourne") that reference relevant products.

**FR19:** The system must implement a content scheduling system that allows for seasonal content updates (e.g., "Spring Planting Guide 2024", "Winter Care Tips").

**FR20:** The system must automatically update content freshness signals (publication dates, "last updated" timestamps) to indicate active, current information.

**FR21:** The system must generate internal linking structures that connect related products, categories, guides, and blog posts to maximize content discoverability.

**FR22:** The system must support user-generated content features (reviews, Q&A, community discussions) to create ongoing content velocity (may be Phase 2).

### Non Functional

**NFR1:** The website must achieve page load times under 3 seconds on 3G connections (Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1).

**NFR2:** The website must be mobile-responsive and provide optimal user experience across desktop, tablet, and mobile devices.

**NFR3:** The website must be accessible and meet WCAG 2.1 Level AA standards.

**NFR4:** The scraping system must respect plantmark.com.au's robots.txt and implement rate limiting to avoid overwhelming their servers (suggested: max 1 request per 2 seconds).

**NFR5:** The system must handle scraping failures gracefully with retry logic, error logging, and notification mechanisms.

**NFR6:** Product pages must be indexable by major search engines (Google, Bing) and AI discovery engines (ChatGPT, Gemini).

**NFR7:** The database must efficiently handle thousands of product records with fast query performance for category filtering and search operations.

**NFR8:** The system must implement proper security measures: HTTPS, input validation, protection against common web vulnerabilities (OWASP Top 10).

**NFR9:** The scraping system must store data in a way that allows for incremental updates (only scrape new/changed products) to minimize load on source website.

**NFR10:** The website must be hosted on infrastructure that supports high availability (99.9% uptime) and can scale to handle traffic spikes from successful SEO rankings.

**NFR11:** All product images must be optimized for web delivery (compressed, appropriate formats, responsive images) without sacrificing quality for plant identification.

**NFR12:** The system must maintain data freshness - product availability and pricing should be updated regularly (suggested: weekly or bi-weekly refresh cycles).

**NFR13:** Content generation must maintain high quality standards - automated content must be reviewed for accuracy, readability, and value before publication.

**NFR14:** The system must implement content freshness strategies: regular updates (suggested: refresh 10-20% of product pages monthly, publish 2-4 blog posts weekly).

**NFR15:** All generated content must be unique and avoid duplicate content penalties - each product page must have substantial unique content beyond basic product information.

**NFR16:** The API-based content management system must support bulk operations for updating large volumes of content efficiently (all operations accessible via API for agent automation).

**NFR17:** The system must track content performance metrics (page views, AI citation frequency if measurable, search rankings) to optimize content strategy.

## User Interface Design Goals

### Overall UX Vision

The website should feel like a comprehensive, authoritative resource for Australian gardeners. The primary user journey focuses on discovery and education before purchase:

- **Discovery-first experience:** Users can browse extensive catalogs, learn about plants, and find the right plants for their needs
- **Information-rich:** Each product page provides comprehensive information to help users make informed decisions
- **Trust-building:** Clear, detailed content establishes expertise and authority
- **Mobile-optimized:** Many users will browse on mobile devices while planning their gardens

The design should balance information density with visual appeal, using high-quality plant photography and clear typography to make content scannable and engaging.

### Key Interaction Paradigms

1. **Browse by category:** Hierarchical navigation through plant categories (Fruit Trees → Citrus → Lemons)
2. **Search and filter:** Powerful search with filters for growing zones, plant type, sun requirements, etc.
3. **Content discovery:** Related articles, guides, and comparisons linked from product pages
4. **Progressive disclosure:** Detailed information available without cluttering initial views
5. **Comparison tools:** Side-by-side product comparisons to help decision-making

### Core Screens and Views

1. **Homepage:** Featured products, seasonal highlights, popular categories, latest blog posts/guides
2. **Product Listing Pages:** Category pages with grid/list views, filtering, sorting
3. **Product Detail Pages:** Comprehensive product information, images, FAQs, care instructions, related products, related articles
4. **Search Results Page:** Product and content results with filtering options
5. **Category Landing Pages:** Rich category descriptions, featured products, growing tips
6. **Blog/Guide Listing:** Archive of articles, guides, seasonal content
7. **Individual Blog/Guide Pages:** Full article with related products embedded
8. **Comparison Pages:** Side-by-side product comparisons (e.g., "Lemon Varieties Compared")
9. **Location-Specific Pages:** Curated plant lists for specific Australian locations/climates

### Accessibility: WCAG AA

The website must meet WCAG 2.1 Level AA standards to ensure accessibility for all users, including:
- Proper heading hierarchy and semantic HTML
- Alt text for all images
- Keyboard navigation support
- Sufficient color contrast
- Screen reader compatibility

### Branding

No specific branding guidelines provided. Recommendations:
- **Color palette:** Natural greens, earth tones, clean whites
- **Typography:** Readable, professional fonts suitable for long-form content
- **Photography:** High-quality, consistent plant photography style
- **Tone:** Authoritative yet approachable, educational but not condescending

### Target Device and Platforms: Web Responsive

The website must provide optimal experience across:
- **Desktop:** Full-featured experience with rich content and detailed product information
- **Tablet:** Touch-optimized navigation and readable content layouts
- **Mobile:** Streamlined experience prioritizing key information and easy navigation

## Technical Assumptions

### Repository Structure: Monorepo

**Rationale:**
- Multiple systems (scraping, content API, ecommerce, frontend) benefit from shared code
- Easier dependency management and versioning
- Better for coordinated deployments
- Simplifies agent access to all codebase components

**Alternative considered:** Polyrepo - rejected due to complexity of managing multiple repos for a single product and increased complexity for agent navigation.

### Service Architecture: Monolith with Modular Components

**Rationale:**
- Phase 1 focuses on content/SEO; Phase 2 adds ecommerce
- Monolith simplifies development and deployment
- Can extract services later if needed
- Lower operational overhead for MVP
- Easier for agents to understand and modify entire system

**Components:**
- Scraping service (can run separately, scheduled via agents)
- Content API (products, categories, blog - all agent-accessible)
- Frontend (SSR/SSG for SEO)

**Alternative considered:** Microservices - rejected as premature optimization for Phase 1 and adds complexity for agent-driven operations.

### Testing Requirements: Unit + Integration

**Rationale:**
- Unit tests for business logic (scraping, content generation)
- Integration tests for API endpoints and database operations
- E2E tests for critical user journeys (can be added in Phase 2)
- All tests must be runnable by agents (CI/CD integration)

### Frontend Technology Stack

**Recommendation:** Next.js (React) with App Router

**Rationale:**
- Server-side rendering (SSR) and static site generation (SSG) for SEO
- Built-in API routes for backend functionality
- Image optimization for product photos
- Strong TypeScript support
- Good performance for Core Web Vitals
- Well-documented for agent understanding

**Alternative considered:** 
- Remix - strong but smaller ecosystem
- Astro - good for content sites, but less flexibility for Phase 2 ecommerce

### Backend Technology Stack

**Recommendation:** Node.js with TypeScript

**Rationale:**
- Shared language with frontend (Next.js)
- Strong ecosystem for web scraping (Puppeteer, Cheerio, Playwright)
- Good performance for I/O-heavy operations (scraping, API)
- TypeScript for type safety across stack
- Excellent agent tooling and code understanding

**Framework options:**
- Next.js API routes (simplest, integrated)
- Express.js (more control, separate service)
- **Recommendation:** Start with Next.js API routes, extract to Express if needed

### Database

**Recommendation:** PostgreSQL

**Rationale:**
- Handles thousands of products efficiently
- Strong full-text search capabilities (important for product search)
- JSON support for flexible product metadata
- Reliable and well-supported
- Good for structured product data and relationships
- Well-understood by agents

**Alternative considered:** 
- MongoDB - rejected due to less structured nature of product data
- SQLite - rejected due to scalability concerns

### Content Management: Agent-Driven API (No Traditional CMS)

**Critical Assumption:** All content management is agent-driven via API endpoints. No traditional CMS UI required.

**Requirements:**
- RESTful API endpoints for all content operations (CRUD for products, blog posts, guides)
- Agent-accessible authentication/authorization (API keys or service accounts)
- Bulk operation endpoints for efficient agent-driven updates
- Content scheduling via API (publish dates, status management)
- All content stored in database, rendered via Next.js pages

**Rationale:**
- Cursor Cloud agents will manage all content creation and updates
- Traditional CMS UI is unnecessary overhead
- API-first approach enables full automation
- Agents can generate, review, and publish content programmatically

**Implementation:**
- Custom API routes in Next.js for content management
- Database schema for products, blog posts, guides, categories
- Agent workflows for content generation and publishing
- No admin UI needed (or minimal status dashboard only)

### Scraping Infrastructure

**Requirements:**
- Australian IP address/proxy for accessing plantmark.com.au
- Rate limiting (1 request per 2 seconds)
- Retry logic with exponential backoff
- Data storage for incremental updates
- Agent-triggered or scheduled scraping jobs

**Recommendation:**
- Use Australian-based proxy/VPN service
- Scraping service can run as separate Node.js process or scheduled job
- Consider using Puppeteer or Playwright for JavaScript-heavy sites
- Store scraping state (last scraped timestamp, product hashes) for incremental updates
- API endpoint to trigger scraping jobs (agent-accessible)
- Webhook or polling mechanism for scraping status/completion

### Image Storage and Optimization

**Recommendation:** Cloud storage (AWS S3, Cloudflare R2, or similar) with CDN

**Rationale:**
- Thousands of product images need efficient storage
- CDN for fast global delivery
- Image optimization pipeline (resize, compress, WebP conversion)
- Consider using Next.js Image component with external image optimization
- API endpoints for image upload/management (agent-accessible)

### Deployment and Hosting

**Recommendation:** Vercel (for Next.js) or AWS/Azure with containerization

**Rationale:**
- Vercel: excellent Next.js integration, good performance, easy deployment
- AWS/Azure: more control, better for complex scraping infrastructure
- Need Australian hosting or CDN edge locations for better performance
- CI/CD integration for agent-triggered deployments

**Recommendation:** Start with Vercel for frontend, separate service for scraping (can be AWS/Azure)

### Search Functionality

**Recommendation:** PostgreSQL full-text search initially, consider Algolia/Meilisearch later

**Rationale:**
- PostgreSQL full-text search sufficient for Phase 1
- Can upgrade to dedicated search service if needed in Phase 2
- Keeps infrastructure simple initially
- API endpoint for search (agent-accessible for testing/debugging)

### SEO and Structured Data

**Requirements:**
- Schema.org markup (Product, Article, BreadcrumbList)
- XML sitemap generation
- Robots.txt management
- Meta tag management

**Recommendation:** 
- Use Next.js SEO libraries (next-seo)
- Generate sitemaps dynamically or via scheduled job (agent-triggerable)
- Structured data via JSON-LD in page components
- API endpoint to regenerate sitemaps on demand

## Epic List

### Epic 1: Foundation & Core Infrastructure
Establish project foundation with database, API structure, and basic infrastructure to support all subsequent development.

### Epic 2: Scraping Infrastructure & Data Import
Build the scraping system to import product inventory from plantmark.com.au, handle international access restrictions, and store data in the database.

### Epic 3: Product Pages & Core SEO
Generate individual product pages with SEO optimization, structured data, and basic product information display.

### Epic 4: Content Generation & Enrichment
Create comprehensive, unique content for products including detailed descriptions, FAQs, category pages, and content generation APIs.

### Epic 5: Content Velocity System
Implement blog posts, guides, comparison pages, and location-specific content to drive ongoing content velocity and AI discovery.

### Epic 6: Search, Discovery & Internal Linking
Implement search functionality, filtering, and intelligent internal linking to connect all content and improve discoverability.

## Epic 1: Foundation & Core Infrastructure

**Expanded Goal:**
Establish the project foundation with Next.js setup, PostgreSQL database, core API structure, and deployment configuration. This epic delivers a working application skeleton with health-check endpoints, database connectivity, and basic API routes that agents can use for all subsequent development. The infrastructure must support thousands of products, content management via API, and SEO-optimized page generation.

### Story 1.1: Project Setup & Next.js Foundation

**As a** developer/agent,  
**I want** a Next.js project with TypeScript, ESLint, and basic configuration,  
**so that** I have a solid foundation for building the application.

**Acceptance Criteria:**
1. Next.js 14+ project initialized with App Router and TypeScript
2. ESLint and Prettier configured with sensible defaults
3. Basic project structure with `/app`, `/lib`, `/types` directories
4. Environment variable configuration (.env.example file)
5. Git repository initialized with .gitignore for Node.js/Next.js
6. README.md with setup instructions and project overview
7. Package.json with all necessary dependencies defined

### Story 1.2: Database Setup & Schema Foundation

**As a** developer/agent,  
**I want** PostgreSQL database configured with initial schema for products, categories, and content,  
**so that** I can store and retrieve product and content data.

**Acceptance Criteria:**
1. PostgreSQL database connection configured (connection pooling)
2. Database migration system set up (Prisma or similar ORM)
3. Initial schema includes: products table (id, name, slug, description, price, availability, category_id, botanical_name, common_name, images, seo_metadata, created_at, updated_at)
4. Initial schema includes: categories table (id, name, slug, parent_id, description, created_at, updated_at)
5. Initial schema includes: blog_posts table (id, title, slug, content, excerpt, published_at, status, author, created_at, updated_at)
6. Foreign key relationships properly defined
7. Indexes created on frequently queried fields (slug, category_id, published_at)
8. Database connection tested and working

### Story 1.3: Core API Routes & Health Check

**As a** developer/agent,  
**I want** basic API routes including health check and database connectivity test,  
**so that** I can verify the system is working and have a foundation for content management APIs.

**Acceptance Criteria:**
1. `/api/health` endpoint returns system status (200 OK)
2. `/api/health/db` endpoint tests database connectivity and returns status
3. API routes follow RESTful conventions
4. Error handling middleware implemented for API routes
5. API responses use consistent JSON format
6. CORS configured appropriately
7. Basic API authentication structure (API key validation middleware skeleton)

### Story 1.4: Deployment Configuration

**As a** developer/agent,  
**I want** deployment configuration for Vercel (or chosen platform),  
**so that** I can deploy the application and have a live environment.

**Acceptance Criteria:**
1. Vercel configuration file (vercel.json) with proper settings
2. Environment variables documented and configured in deployment platform
3. Database connection configured for production environment
4. Build process verified (npm run build succeeds)
5. Deployment pipeline tested (can deploy successfully)
6. Health check endpoints accessible on deployed environment
7. Basic monitoring/logging setup (optional but recommended)

## Epic 2: Scraping Infrastructure & Data Import

**Expanded Goal:**
Build a robust scraping system that can access plantmark.com.au despite international restrictions, extract product data efficiently, and store it in our database. This epic delivers the ability to import thousands of products with proper error handling, rate limiting, and incremental update capabilities. The system must respect the source website's resources while ensuring complete data acquisition.

### Story 2.1: Scraping Infrastructure Setup

**As a** developer/agent,  
**I want** scraping infrastructure with proxy/VPN support and basic scraping tools configured,  
**so that** I can access plantmark.com.au from international locations.

**Acceptance Criteria:**
1. Puppeteer or Playwright configured for browser automation
2. Proxy/VPN configuration support (environment variables for Australian IP)
3. User-agent rotation capability
4. Rate limiting mechanism (1 request per 2 seconds minimum)
5. Robots.txt parser to respect site rules
6. Basic error handling for network failures
7. Logging system for scraping operations

### Story 2.2: Plantmark.com.au Scraper Implementation

**As a** developer/agent,  
**I want** a scraper that can extract product data from plantmark.com.au,  
**so that** I can import product inventory into the database.

**Acceptance Criteria:**
1. Scraper can navigate plantmark.com.au product listing pages
2. Scraper extracts: product name, description, images, price, availability, category, botanical name, common name
3. Scraper handles pagination to get all products
4. Scraper extracts category hierarchy information
5. Image URLs are captured and can be downloaded
6. Scraper handles dynamic content loading (waits for JavaScript)
7. Scraper outputs structured data (JSON format)

### Story 2.3: Data Processing & Validation

**As a** developer/agent,  
**I want** data processing and validation logic for scraped product data,  
**so that** only valid, complete products are stored in the database.

**Acceptance Criteria:**
1. Data validation rules defined (required fields, format checks)
2. Data normalization (slug generation, text cleaning, price formatting)
3. Duplicate detection (identify products already in database)
4. Image URL validation and download preparation
5. Category mapping and hierarchy creation
6. Data transformation pipeline (raw scraped data → database-ready format)
7. Validation errors logged with product identifiers

### Story 2.4: Database Import & Storage

**As a** developer/agent,  
**I want** import functionality that stores scraped products in the database,  
**so that** products are available for display on the website.

**Acceptance Criteria:**
1. Bulk import API endpoint (`POST /api/admin/products/import`)
2. Products inserted/updated in database with proper relationships
3. Categories created/updated with hierarchy maintained
4. Image URLs stored (images can be downloaded separately)
5. Import progress tracking (how many products imported, errors)
6. Transaction handling (rollback on critical errors)
7. Import results returned (success count, error count, error details)

### Story 2.5: Error Handling & Retry Logic

**As a** developer/agent,  
**I want** robust error handling and retry logic for scraping operations,  
**so that** temporary failures don't stop the entire import process.

**Acceptance Criteria:**
1. Retry logic with exponential backoff for failed requests
2. Maximum retry attempts configured (suggested: 3 attempts)
3. Different error types handled (network, timeout, parsing, rate limit)
4. Failed products logged with error details
5. Partial success handling (some products succeed, others fail)
6. Resume capability (can restart from last successful product)
7. Error notification system (logs, optional alerts)

### Story 2.6: Incremental Update System

**As a** developer/agent,  
**I want** incremental update capability that only scrapes new/changed products,  
**so that** I can efficiently keep inventory current without full re-scrapes.

**Acceptance Criteria:**
1. Product hash/checksum system to detect changes
2. Last-scraped timestamp tracking per product
3. Incremental update API endpoint (`POST /api/admin/products/update-incremental`)
4. Only new/changed products are scraped and updated
5. Deleted product detection (products removed from source)
6. Update statistics returned (new products, updated products, deleted products)
7. Full re-scrape option still available when needed

## Epic 3: Product Pages & Core SEO

**Expanded Goal:**
Create individual product pages that are fully optimized for SEO and AI discovery. This epic delivers dynamic product pages with proper URL structure, meta tags, structured data, and semantic HTML. Each product page must be indexable, fast-loading, and contain comprehensive product information to rank well in search engines and be discoverable by AI systems.

### Story 3.1: Dynamic Product Page Routes

**As a** user,  
**I want** to access product pages via SEO-friendly URLs,  
**so that** I can view product details and search engines can index them.

**Acceptance Criteria:**
1. Dynamic route `/products/[category]/[slug]` implemented in Next.js
2. Product pages load product data from database based on slug
3. 404 page displayed for non-existent products
4. URL structure follows pattern: `/products/{category-slug}/{product-slug}`
5. Category slug and product slug are URL-safe (lowercase, hyphens)
6. Product pages render basic product information (name, description, price, images)
7. Page loads successfully for all products in database

### Story 3.2: SEO Meta Tags & Structured Data

**As a** search engine/AI discovery engine,  
**I want** properly formatted meta tags and structured data on product pages,  
**so that** I can understand and index the product information correctly.

**Acceptance Criteria:**
1. Dynamic meta titles generated per product (includes product name, category)
2. Dynamic meta descriptions generated per product (compelling, includes key terms)
3. Open Graph tags for social sharing (og:title, og:description, og:image)
4. Twitter Card tags implemented
5. Schema.org Product markup (JSON-LD) with: name, description, image, price, availability, brand, category
6. Canonical URLs set correctly
7. Robots meta tags configured appropriately

### Story 3.3: Product Page Content & Layout

**As a** user,  
**I want** comprehensive product information displayed clearly on product pages,  
**so that** I can make informed decisions about products.

**Acceptance Criteria:**
1. Product name displayed prominently (H1 tag)
2. Product images displayed with alt text (semantic HTML)
3. Product description displayed with proper formatting
4. Price and availability status displayed clearly
5. Botanical name and common name displayed
6. Category breadcrumb navigation implemented
7. Related products section (products in same category)
8. Mobile-responsive layout
9. Semantic HTML structure (proper heading hierarchy, article tags)

### Story 3.4: Image Optimization & Delivery

**As a** user,  
**I want** fast-loading, optimized product images,  
**so that** pages load quickly and images look good.

**Acceptance Criteria:**
1. Next.js Image component used for all product images
2. Images served in modern formats (WebP with fallback)
3. Responsive image sizes (different sizes for mobile/tablet/desktop)
4. Lazy loading implemented for below-fold images
5. Image optimization pipeline (compression, resizing)
6. Alt text generated/displayed for all images (includes product name)
7. Image CDN integration (if using external storage)
8. Core Web Vitals: LCP < 2.5s for images

### Story 3.5: Category Listing Pages

**As a** user,  
**I want** category pages that list products in each category,  
**so that** I can browse products by type.

**Acceptance Criteria:**
1. Dynamic route `/categories/[slug]` implemented
2. Category pages display category name and description
3. Products in category displayed in grid/list layout
4. Pagination implemented for categories with many products
5. SEO meta tags for category pages (title, description)
6. Breadcrumb navigation on category pages
7. Category hierarchy displayed (parent categories)
8. Filtering/sorting options (can be basic initially)

### Story 3.6: XML Sitemap Generation

**As a** search engine,  
**I want** an XML sitemap with all product and category pages,  
**so that** I can efficiently discover and index all pages.

**Acceptance Criteria:**
1. Dynamic sitemap generation (`/sitemap.xml`)
2. All product pages included with proper URLs
3. All category pages included
4. Last modified dates included
5. Priority and change frequency set appropriately
6. Sitemap split into multiple files if >50,000 URLs (sitemap index)
7. Sitemap regenerated when products added/updated
8. Robots.txt references sitemap location

## Epic 4: Content Generation & Enrichment

**Expanded Goal:**
Create comprehensive, unique content for each product that goes beyond basic product information. This epic delivers automated content generation capabilities including detailed product descriptions, FAQ sections, enriched category pages, and APIs for agent-driven content management. The content must be unique, valuable, and optimized for both SEO and AI discovery engines.

### Story 4.1: Content Generation API Foundation

**As a** Cursor Cloud agent,  
**I want** API endpoints for creating and updating product content,  
**so that** I can programmatically generate and manage content.

**Acceptance Criteria:**
1. `POST /api/admin/products/[id]/content` endpoint for updating product content
2. `GET /api/admin/products/[id]/content` endpoint for retrieving current content
3. Content fields: detailed_description, faq_items, growing_requirements, care_instructions, companion_plants
4. API authentication/authorization (API key validation)
5. Content validation (required fields, length limits)
6. Content versioning/history tracking (optional but recommended)
7. Bulk content update endpoint (`POST /api/admin/products/bulk-content`)

### Story 4.2: Enhanced Product Descriptions

**As a** user/search engine,  
**I want** comprehensive, unique product descriptions on each product page,  
**so that** I can understand the product fully and the content is valuable for SEO.

**Acceptance Criteria:**
1. Product pages display detailed descriptions (beyond basic scraped description)
2. Descriptions include: botanical information, growing requirements, ideal conditions, plant characteristics
3. Descriptions are unique per product (no duplicate content)
4. Descriptions are well-written and informative (500+ words target)
5. Descriptions include relevant keywords naturally
6. Content stored in database and editable via API
7. Descriptions displayed prominently on product pages

### Story 4.3: Product FAQ Sections

**As a** user/AI discovery engine,  
**I want** FAQ sections on product pages with common questions and detailed answers,  
**so that** I can find answers to common questions and AI systems can reference this information.

**Acceptance Criteria:**
1. FAQ items stored in database (question, answer, product_id)
2. FAQ sections displayed on product pages (expandable/collapsible)
3. Common questions included: watering frequency, soil type, sun requirements, planting time, pruning needs
4. Answers are detailed and informative (not just yes/no)
5. FAQ content editable via API (`POST /api/admin/products/[id]/faq`)
6. FAQ items include structured data (FAQPage schema.org markup)
7. FAQ sections are mobile-friendly and accessible

### Story 4.4: Category Page Content Enrichment

**As a** user/search engine,  
**I want** rich, informative content on category pages beyond just product listings,  
**so that** category pages provide value and rank well in search results.

**Acceptance Criteria:**
1. Category pages include detailed category descriptions (200+ words)
2. Category descriptions include: overview of category, growing tips, common characteristics, seasonal advice
3. Category descriptions are unique per category
4. Category pages include "Featured Products" section
5. Category pages include "Growing Tips" section specific to category
6. Content editable via API (`POST /api/admin/categories/[id]/content`)
7. Category descriptions displayed prominently above product listings

### Story 4.5: Content Quality & Uniqueness Validation

**As a** developer/agent,  
**I want** validation to ensure content quality and uniqueness,  
**so that** we avoid duplicate content penalties and maintain high content standards.

**Acceptance Criteria:**
1. Content uniqueness checking (compare against existing content)
2. Minimum length validation for descriptions (e.g., 300 words minimum)
3. Keyword density checking (ensure natural keyword usage)
4. Readability scoring (Flesch Reading Ease or similar)
5. Duplicate content detection and warnings
6. Content quality metrics returned with API responses
7. Validation errors prevent low-quality content from being saved

### Story 4.6: Automated Content Generation Workflow

**As a** Cursor Cloud agent,  
**I want** a workflow system for generating content for multiple products,  
**so that** I can efficiently create content at scale.

**Acceptance Criteria:**
1. Bulk content generation API endpoint (`POST /api/admin/products/generate-content`)
2. Content generation can target: all products, products without content, specific categories
3. Generation progress tracking (how many products processed)
4. Content generation uses product data (name, category, botanical info) as input
5. Generated content saved via content API endpoints
6. Generation results returned (success count, error count, product IDs)
7. Can resume interrupted generation jobs

## Epic 5: Content Velocity System

**Expanded Goal:**
Implement a content velocity system that generates regular, fresh content including blog posts, guides, comparison pages, and location-specific content. This epic delivers the infrastructure and APIs needed for agents to create and publish content at scale, driving ongoing SEO improvements and AI discovery. The system must support content scheduling, categorization, and automatic internal linking.

### Story 5.1: Blog Post API & Database Schema

**As a** Cursor Cloud agent,  
**I want** API endpoints and database schema for managing blog posts,  
**so that** I can create, update, and publish blog content programmatically.

**Acceptance Criteria:**
1. Blog posts table extended with: tags, categories, featured_image, author, reading_time, status (draft/published/scheduled)
2. `POST /api/admin/blog-posts` endpoint for creating blog posts
3. `PUT /api/admin/blog-posts/[id]` endpoint for updating blog posts
4. `GET /api/admin/blog-posts` endpoint for listing blog posts (with filtering)
5. `DELETE /api/admin/blog-posts/[id]` endpoint for deleting blog posts
6. API supports scheduling (published_at field)
7. API authentication/authorization

### Story 5.2: Blog Post Pages & Listing

**As a** user/search engine,  
**I want** blog post pages and a blog listing page,  
**so that** I can read articles and search engines can index them.

**Acceptance Criteria:**
1. Dynamic route `/blog/[slug]` for individual blog posts
2. Blog listing page `/blog` with pagination
3. Blog posts display: title, content, author, published date, tags, categories
4. Blog posts include SEO meta tags (title, description, Open Graph)
5. Blog posts include Schema.org Article markup
6. Related blog posts section on individual posts
7. Blog listing shows excerpts and featured images
8. Mobile-responsive layout

### Story 5.3: Guide Pages System

**As a** user/search engine,  
**I want** guide pages (how-to guides, care guides, seasonal guides),  
**so that** I can access comprehensive gardening information.

**Acceptance Criteria:**
1. Guide content type in database (similar to blog posts but with guide-specific fields)
2. Dynamic route `/guides/[slug]` for individual guides
3. Guide listing page `/guides` with categorization
4. Guides include: step-by-step instructions, related products, images
5. Guides include SEO optimization (meta tags, structured data)
6. Guides can be linked from product pages
7. Guide API endpoints (`POST /api/admin/guides`, etc.)
8. Guides displayed with proper formatting (headings, lists, images)

### Story 5.4: Comparison Pages Generation

**As a** user/search engine,  
**I want** comparison pages that compare similar products,  
**so that** I can make informed decisions and additional content pages are created for SEO.

**Acceptance Criteria:**
1. Comparison page content type in database
2. Dynamic route `/compare/[product1]-vs-[product2]` or `/compare/[topic]`
3. Comparison pages display: side-by-side comparison table, pros/cons, recommendations
4. Comparison pages include SEO optimization
5. Comparison pages automatically link to compared products
6. Comparison page API (`POST /api/admin/comparisons`)
7. Comparison pages can be generated for: product pairs, product categories, topics
8. Comparison pages include structured data (Comparison schema)

### Story 5.5: Location-Specific Content Pages

**As a** user/search engine,  
**I want** location-specific content pages (e.g., "Best Plants for Sydney"),  
**so that** I can find plants suitable for my location and additional SEO-optimized pages are created.

**Acceptance Criteria:**
1. Location-specific page content type in database
2. Dynamic route `/locations/[location-slug]` or `/guides/[location]-plants`
3. Location pages display: location-specific plant recommendations, climate information, growing tips
4. Location pages include product listings filtered by location suitability
5. Location pages include SEO optimization (location-specific keywords)
6. Location page API (`POST /api/admin/location-pages`)
7. Location pages can target: cities, regions, climate zones, states
8. Location pages include structured data (local relevance)

### Story 5.6: Content Scheduling & Publishing Workflow

**As a** Cursor Cloud agent,  
**I want** content scheduling and automated publishing,  
**so that** I can schedule content to be published at optimal times.

**Acceptance Criteria:**
1. Content scheduling via API (published_at field)
2. Scheduled content automatically published when date/time reached
3. Background job/cron to check and publish scheduled content
4. Content status management (draft → scheduled → published)
5. Bulk scheduling API (`POST /api/admin/content/schedule-bulk`)
6. Scheduling calendar view API (`GET /api/admin/content/schedule`)
7. Notification system for published content (optional)

### Story 5.7: Internal Linking System

**As a** user/search engine,  
**I want** intelligent internal linking between related content,  
**so that** I can discover related content and SEO is improved through content connections.

**Acceptance Criteria:**
1. Internal linking algorithm that identifies related content
2. Related products automatically linked on product pages
3. Related blog posts/guides linked on content pages
4. Related products linked in blog posts and guides
5. Internal links use descriptive anchor text
6. Link generation happens automatically when content is published
7. Link structure stored in database for tracking
8. Internal linking API for manual link management (`POST /api/admin/links`)

### Story 5.8: Content Freshness & Update System

**As a** search engine/AI discovery engine,  
**I want** content freshness signals and regular content updates,  
**so that** I know the content is current and actively maintained.

**Acceptance Criteria:**
1. "Last updated" timestamps on all content pages
2. Content update API (`POST /api/admin/content/[id]/update-timestamp`)
3. Bulk content refresh workflow (update 10-20% of product pages monthly)
4. Content freshness displayed prominently on pages
5. Sitemap includes last modified dates
6. Content update tracking in database
7. API endpoint to trigger content refresh jobs (`POST /api/admin/content/refresh`)

## Epic 6: Search, Discovery & Internal Linking

**Expanded Goal:**
Implement comprehensive search functionality, advanced filtering, and intelligent content discovery features. This epic delivers user-facing search capabilities, category filtering, and enhanced internal linking to help users find products and content while improving SEO through better content connections and user engagement signals.

### Story 6.1: Basic Search Functionality

**As a** user,  
**I want** to search for products by name, botanical name, or common name,  
**so that** I can quickly find products I'm looking for.

**Acceptance Criteria:**
1. Search input field on all pages (header navigation)
2. Search API endpoint (`GET /api/search?q={query}`)
3. Search queries products by: name, botanical_name, common_name, description
4. Search uses PostgreSQL full-text search
5. Search results returned in JSON format with product data
6. Search handles typos and partial matches (fuzzy search)
7. Search is fast (<500ms response time)
8. Search input includes autocomplete/suggestions (optional enhancement)

### Story 6.2: Search Results Page

**As a** user/search engine,  
**I want** a search results page that displays search results clearly,  
**so that** I can see matching products and search engines can index search result pages.

**Acceptance Criteria:**
1. Search results page route `/search?q={query}`
2. Search results display: product name, image, price, brief description, category
3. Search results paginated (20 results per page)
4. Search results include "No results found" message when appropriate
5. Search results page includes SEO meta tags
6. Search results page includes breadcrumb navigation
7. Search query displayed prominently on results page
8. Mobile-responsive search results layout

### Story 6.3: Advanced Filtering & Sorting

**As a** user,  
**I want** to filter and sort search results and product listings,  
**so that** I can narrow down products to find exactly what I need.

**Acceptance Criteria:**
1. Filter options: category, price range, availability, growing zone, plant type
2. Multiple filters can be applied simultaneously
3. Sort options: price (low to high, high to low), name (A-Z, Z-A), newest
4. Filters displayed as checkboxes/dropdowns
5. Active filters displayed with ability to remove individual filters
6. Filter state maintained in URL query parameters
7. Filter API endpoint (`GET /api/products?category={id}&price_min={min}&price_max={max}`)
8. Filter results update dynamically without full page reload

### Story 6.4: Category Filtering Enhancement

**As a** user,  
**I want** enhanced category filtering on category pages,  
**so that** I can find products within categories more easily.

**Acceptance Criteria:**
1. Category pages include filter sidebar
2. Filters available: price, availability, growing zone, plant characteristics
3. Filter counts displayed (e.g., "15 products match your filters")
4. Clear filters button
5. Filters work in combination with category selection
6. Filtered results update URL for sharing/bookmarking
7. Mobile-friendly filter interface (collapsible sidebar or modal)

### Story 6.5: Related Content Discovery

**As a** user,  
**I want** to discover related products and content,  
**so that** I can explore more options and find additional relevant information.

**Acceptance Criteria:**
1. "Related Products" section on product pages (products in same category, similar characteristics)
2. "Related Articles" section on product pages (blog posts/guides mentioning the product)
3. "You May Also Like" recommendations based on viewing patterns
4. Related content algorithm considers: category, tags, botanical relationships
5. Related content displayed with images and brief descriptions
6. Related content links properly styled and accessible
7. Related content API endpoint (`GET /api/products/[id]/related`)

### Story 6.6: Search Analytics & Optimization

**As a** developer/agent,  
**I want** search analytics and optimization capabilities,  
**so that** I can improve search functionality and understand user behavior.

**Acceptance Criteria:**
1. Search queries logged in database (query, results count, timestamp)
2. Search analytics API (`GET /api/admin/analytics/search`)
3. Popular searches tracked and displayed
4. Zero-result searches identified for content gap analysis
5. Search performance metrics tracked (response time, result relevance)
6. Search suggestions can be manually curated via API
7. Analytics data used to improve search relevance

## Checklist Results Report

### Executive Summary

**Overall PRD Completeness:** 85%

**MVP Scope Appropriateness:** Just Right (with Phase 1/Phase 2 split clearly defined)

**Readiness for Architecture Phase:** Nearly Ready (minor gaps identified below)

**Most Critical Gaps:**
1. User personas and target audience need more specificity
2. Success metrics need quantification (baseline measurements)
3. Some technical risks need deeper investigation (scraping legal/ethical considerations)
4. User research/competitive analysis could be more detailed

### Category Analysis

| Category | Status | Critical Issues |
|----------|--------|-----------------|
| 1. Problem Definition & Context | PARTIAL (75%) | User personas not defined; success metrics lack quantification; limited user research documented |
| 2. MVP Scope Definition | PASS (95%) | Phase 1/Phase 2 split is clear; scope boundaries well-defined; MVP validation approach could be more specific |
| 3. User Experience Requirements | PASS (90%) | Core screens defined; accessibility standards specified; user journeys could be more detailed |
| 4. Functional Requirements | PASS (95%) | Comprehensive requirements; well-structured stories; acceptance criteria are testable |
| 5. Non-Functional Requirements | PASS (90%) | Performance targets defined; security considerations addressed; some scalability details could be more specific |
| 6. Epic & Story Structure | PASS (95%) | Epics are well-structured; stories appropriately sized; logical sequencing |
| 7. Technical Guidance | PASS (90%) | Technical stack decisions documented with rationale; some technical risks need deeper investigation |
| 8. Cross-Functional Requirements | PARTIAL (80%) | Data requirements well-defined; integration requirements clear; operational requirements could be more detailed |
| 9. Clarity & Communication | PASS (95%) | Documentation is well-structured; terminology is consistent; change log maintained |

### Top Issues by Priority

#### BLOCKERS (Must fix before architect can proceed)
1. **Scraping Legal/Ethical Considerations:** Need explicit confirmation that scraping plantmark.com.au is legally permissible and ethically acceptable. Should respect robots.txt and rate limiting (already addressed in NFR4, but legal review recommended).

#### HIGH (Should fix for quality)
1. **User Personas:** Define specific target user personas (e.g., "Home gardener in Sydney suburbs", "Professional landscaper", "Plant enthusiast"). Currently only general "Australian gardeners" mentioned.
2. **Success Metrics Quantification:** Goals mention "outrank daleysfruit.com.au" but lack specific metrics:
   - Target keyword rankings (top 10 for X keywords?)
   - Traffic goals (X visitors/month by Y date?)
   - Content velocity targets (already specified: 2-4 blog posts/week)
   - SEO score improvements
3. **User Research:** Document any existing user research or competitive analysis findings. What do users want that competitors don't provide?
4. **MVP Validation Approach:** Define how Phase 1 success will be measured:
   - SEO ranking improvements?
   - Content indexing success?
   - AI discovery frequency?
   - User engagement metrics?

#### MEDIUM (Would improve clarity)
1. **User Journey Details:** While core screens are defined, detailed user flows (step-by-step journeys) could be documented (e.g., "User searches for 'lemon tree' → views product page → reads FAQ → browses related products").
2. **Error Handling Details:** More specific error handling requirements (what happens when scraping fails completely? What if plantmark.com.au changes their structure?)
3. **Content Quality Review Process:** NFR13 mentions content review, but process for agent-driven content review could be more detailed.
4. **Operational Monitoring:** More specific monitoring requirements (what metrics to track? Alert thresholds? Dashboard needs?)

#### LOW (Nice to have)
1. **Competitive Analysis Details:** More detailed analysis of daleysfruit.com.au strengths/weaknesses
2. **Branding Guidelines:** More specific branding requirements if available
3. **Content Calendar:** Example content calendar or seasonal content strategy
4. **Analytics Integration:** Specific analytics tools (Google Analytics? Custom dashboard?)

### MVP Scope Assessment

**Features that might be cut for true MVP:**
- Story 6.6 (Search Analytics) - Could be deferred to Phase 2
- Story 5.8 (Content Freshness & Update System) - Basic freshness could be included, but bulk refresh workflow could be Phase 2
- Advanced filtering features (Story 6.3, 6.4) - Basic filtering could suffice initially

**Missing features that are essential:**
- Homepage implementation (mentioned in UI Goals but no epic/story)
- Image download/storage workflow (scraped images need to be downloaded and stored)
- Basic analytics tracking (even if just page views)

**Complexity Concerns:**
- Scraping infrastructure (Epic 2) is complex and critical - ensure adequate time/resources
- Content generation at scale (Epic 4, 5) - need to validate agent capabilities for generating thousands of unique product descriptions
- International access restrictions - proxy/VPN setup may require additional infrastructure costs

**Timeline Realism:**
- 6 epics with 30+ stories total - this is substantial work
- Phase 1 scope is appropriate for MVP, but timeline should account for:
  - Scraping infrastructure setup and testing
  - Content generation and quality review
  - SEO optimization and testing

### Technical Readiness

**Clarity of Technical Constraints:**
- ✅ Technology stack decisions are clear (Next.js, PostgreSQL, Node.js)
- ✅ Architecture approach is defined (Monolith with modular components)
- ✅ Agent-driven content management is well-articulated

**Identified Technical Risks:**
1. **Scraping Reliability:** plantmark.com.au may change structure, block scrapers, or implement anti-bot measures
2. **Content Generation Quality:** Automated content generation at scale may produce low-quality or duplicate content
3. **International Access:** Proxy/VPN costs and reliability for Australian IP addresses
4. **Scalability:** Handling thousands of products and pages may require optimization
5. **Image Storage Costs:** Thousands of product images require significant storage/CDN costs

**Areas Needing Architect Investigation:**
1. Scraping infrastructure architecture (separate service? scheduled jobs? real-time?)
2. Image storage and CDN integration strategy
3. Database schema optimization for thousands of products
4. Content generation pipeline architecture (how to generate, validate, and publish at scale)
5. SEO infrastructure (sitemap generation, structured data management)

### Recommendations

**Immediate Actions (Before Architecture):**
1. **Legal Review:** Confirm scraping plantmark.com.au is legally permissible. Document robots.txt compliance strategy.
2. **User Personas:** Define 2-3 specific user personas with use cases
3. **Success Metrics:** Quantify success metrics:
   - Target: Rank in top 10 for X keywords within Y months
   - Target: X product pages indexed by Google within Y weeks
   - Target: X blog posts published per week
4. **Homepage Story:** Add Epic 1 story for homepage implementation (or Epic 3 story)

**Architecture Phase Considerations:**
1. **Scraping Service Design:** Architect should design scraping service as separate, scalable component
2. **Content Generation Pipeline:** Design for agent-driven content generation with quality gates
3. **Image Pipeline:** Design image download, optimization, and CDN integration workflow
4. **Monitoring Strategy:** Define key metrics and monitoring infrastructure

**Development Phase Considerations:**
1. **Incremental Delivery:** Consider delivering basic product pages (Epic 3) before full content enrichment (Epic 4)
2. **Content Quality:** Implement content quality validation early (Story 4.5) before bulk generation
3. **Testing Strategy:** Ensure scraping infrastructure has robust testing (mocking, test data)

### Final Decision

**NEEDS REFINEMENT** - The PRD is comprehensive and well-structured, but requires addressing the HIGH priority items (user personas, quantified success metrics, MVP validation approach) before proceeding to architecture phase. The technical foundation is solid, but legal/ethical considerations around scraping should be confirmed.

**Recommended Next Steps:**
1. Address HIGH priority items (user personas, success metrics)
2. Add homepage implementation story
3. Confirm legal/ethical considerations for scraping
4. Proceed to architecture phase with identified technical risks in mind

## Next Steps

### UX Expert Prompt

Create UX design for an online nursery ecommerce website focused on SEO and content discovery. Review the PRD at `docs/prd.md` and create comprehensive UX designs including user journeys, wireframes for core screens (homepage, product pages, category pages, blog/guide pages), and interaction patterns. Focus on information-rich, discovery-first experience optimized for mobile and desktop. Ensure designs support content velocity strategy and AI discovery optimization.

### Architect Prompt

Create technical architecture for an online nursery ecommerce website. Review the PRD at `docs/prd.md` and design the system architecture including: Next.js application structure, PostgreSQL database schema, scraping infrastructure, API design for agent-driven content management, image storage/CDN strategy, and deployment architecture. Key considerations: agent-driven content management (no traditional CMS), scraping system with international access handling, scalability for thousands of products, and SEO optimization. Address technical risks identified in the checklist (scraping reliability, content generation pipeline, image storage costs).

