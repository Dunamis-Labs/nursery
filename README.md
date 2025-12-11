# Online Nursery Ecommerce Website

An SEO-focused ecommerce platform for an online nursery, built with Next.js, TypeScript, and PostgreSQL. The platform features agent-driven content management, automated content optimization, and continuous improvement workflows using Statsig and Google Analytics.

## 🎯 Project Goals

- **Phase 1:** Create a strong online presence for SEO and AI discovery (ChatGPT/Gemini)
- **Phase 2:** Receive online orders

**Current Focus:** Building an extensive inventory of products with highly optimized pages for SEO and AI discovery.

## 🏗️ Architecture

This is a monorepo built with npm workspaces, containing:

- **`apps/web`** - Next.js frontend + API routes
- **`packages/db`** - Prisma schema and database client
- **`packages/shared`** - Shared types and utilities
- **`packages/api-client`** - Shared API client for agent use
- **`packages/fulfillment`** - Fulfillment logic (digital, dropship, inventory)

See [docs/architecture.md](./docs/architecture.md) for complete architecture details.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ 
- npm 10+
- PostgreSQL (via Supabase recommended)

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

## 📚 Documentation

- [Product Requirements Document](./docs/prd.md) - Complete PRD with epics and stories
- [Architecture Document](./docs/architecture.md) - Full technical architecture

## 🛠️ Development

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run migrations
npm run db:push          # Push schema changes
npm run db:studio        # Open Prisma Studio

# Code Quality
npm run lint             # Run linters
npm run type-check       # Type check all packages
npm run format           # Format code
npm run test             # Run tests
```

## 🔧 Tech Stack

- **Frontend:** Next.js 14+ (App Router), React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL (via Supabase)
- **Deployment:** Vercel
- **CI/CD:** GitHub Actions
- **Analytics:** Google Analytics 4 (via MCP)
- **Experimentation:** Statsig (via MCP)
- **Agent Framework:** BMAD + Cursor Cloud Agents

## 📦 Project Structure

```
nursery/
├── apps/
│   └── web/              # Next.js application
├── packages/
│   ├── db/               # Database (Prisma)
│   ├── shared/           # Shared types/utils
│   ├── api-client/        # API client
│   └── fulfillment/       # Fulfillment logic
├── docs/                  # Documentation
├── scripts/               # Utility scripts
└── infrastructure/        # IaC configs
```

## 🤖 Agent-Driven Development

This project is designed to be managed by Cursor Cloud agents:

- **BMAD Product Owner Agent** - Strategic decision-making and workflow orchestration
- **Content Generation Agent** - Content creation and optimization
- **Analytics Agent** - Performance monitoring and analysis
- **Data Import Agent** - Product data management

See [docs/architecture.md](./docs/architecture.md#agent-driven-automation--continuous-improvement) for details.

## 📝 License

Private - Dunamis Labs

## 🔗 Links

- GitHub: https://github.com/Dunamis-Labs
- Documentation: [docs/](./docs/)

