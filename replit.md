# 위세아이텍 - Enterprise Data asset

## Overview

위세아이텍 is a B2B enterprise data asset platform that sells premium datasets for financial analysis, geospatial intelligence, and consumer behavior analytics. The platform features a professional, trust-focused design aimed at data professionals and enterprises. It integrates with PayApp (Korean payment gateway) for processing dataset purchases and includes cash receipt issuance functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **Build Tool**: Vite with HMR support

**Design System**: The application follows enterprise SaaS design patterns with:
- Inter font for primary text, JetBrains Mono for technical content
- Light/dark theme support via CSS variables
- Fixed sidebar navigation (320px width) with vertical dataset cards
- Professional aesthetic emphasizing trust and data clarity

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Pattern**: RESTful JSON API under `/api` prefix
- **Build**: esbuild for production bundling with selective dependency bundling

**Key API Endpoints**:
- `GET /api/datasets` - List available datasets
- `GET /api/datasets/:id` - Get dataset details
- `POST /api/payment/request` - Initiate payment via PayApp
- `POST /api/payment/callback` - Payment completion webhook

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts`
- **Migrations**: Drizzle Kit with migrations in `/migrations`
- **Session Storage**: In-memory storage for development (MemStorage class), with connect-pg-simple available for production sessions

**Current Schema**:
- `users` table for authentication
- In-memory payment request tracking (designed for PostgreSQL persistence)

### Authentication
- User table with username/password authentication
- Session-based auth infrastructure (Passport.js available)
- Currently minimal auth implementation

## External Dependencies

### Payment Processing
- **Creem API** (Global payment gateway): `https://api.creem.io/v1`
- Uses pre-registered products with fixed pricing in USD
- Product ID mapping maintained in `server/routes.ts` via `CREEM_PRODUCT_MAP`
- Two registered products:
  * "cinematic-camera-motion-kit" -> prod_2daxDlFjJ3uDLJPgrBzw20 ($1,610)
  * "hires-3d-modeling-dataset" -> prod_5f70m6iE2O43GMuRcIHIWe ($850)
- Configured via `CREEM_API_KEY` and `CREEM_WEBHOOK_SECRET` environment variables
- Webhook URL: https://wisedata.ai.kr/api/creem/webhook

### Database
- **PostgreSQL**: Required, configured via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database access with Zod schema integration

### Third-Party UI Libraries
- Radix UI primitives for accessible components
- Embla Carousel for carousel functionality
- react-day-picker for calendar components
- Vaul for drawer components
- cmdk for command palette

### Development Tools
- Replit-specific Vite plugins for development (cartographer, dev-banner, runtime-error-modal)
- TypeScript for full-stack type safety
- Zod for runtime validation with drizzle-zod integration