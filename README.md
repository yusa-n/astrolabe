<p align="center">
	<img src="image.jpg" alt="Astrolabe" />
	<h1 align="center"><b>Astrolabe</b></h1>
	<p align="center">
    <a href="https://curino.co"><strong>Website</strong></a> ·
    <a href="https://github.com/yusa-n/astrolabe/issues"><strong>Issues</strong></a> ·
    <a href="#whats-included"><strong>What's included</strong></a> ·
    <a href="#prerequisites"><strong>Prerequisites</strong></a> ·
    <a href="#getting-started"><strong>Getting Started</strong></a> ·
    <a href="#how-to-use"><strong>How to use</strong></a>
  </p>
</p>

Everything you need to build a production-ready SaaS. An opinionated stack based on learnings from building Midday using the latest Next.js framework. It's a monorepo with a focus on code reuse, edge computing, and best practices that will scale with your business.

## What's included

### Core Technologies
[Next.js](https://nextjs.org/) - Framework<br>
[Turborepo](https://turbo.build) - Build system<br>
[Bun](https://bun.sh/) - Package manager & runtime<br>
[TypeScript](https://www.typescriptlang.org/) - Type safety<br>
[TailwindCSS](https://tailwindcss.com/) - Styling<br>
[Shadcn](https://ui.shadcn.com/) - UI components<br>

### Backend & Infrastructure
[Cloudflare Workers](https://workers.cloudflare.com/) - Edge computing platform<br>
[Cloudflare D1](https://developers.cloudflare.com/d1/) - Edge-native SQLite database<br>
[Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM<br>
[Hono.js](https://hono.dev/) - Lightweight edge API framework<br>
[Clerk](https://clerk.com/) - Authentication & user management<br>
[Upstash Redis](https://upstash.com/) - Serverless Redis for rate limiting<br>

### Frontend & Developer Experience
[react-safe-action](https://next-safe-action.dev) - Type-safe Server Actions<br>
[nuqs](https://nuqs.47ng.com/) - Type-safe URL state management<br>
[next-themes](https://next-themes-example.vercel.app/) - Theme manager<br>
[next-international](https://next-international.vercel.app/) - Internationalization<br>
[Zod](https://zod.dev/) - Schema validation<br>

### Development Tools
[Biome](https://biomejs.dev) - Fast linter & formatter (replaces ESLint/Prettier)<br>
[Sherif](https://github.com/QuiiBz/sherif) - Monorepo linting<br>

### Services & Integrations
[React Email](https://react.email/) - Email templates<br>
[Resend](https://resend.com/) - Email delivery<br>
[Sentry](https://sentry.io/) - Error monitoring<br>
[OpenPanel](https://openpanel.dev/) - Privacy-friendly analytics<br>
[Stripe](https://stripe.com) - Billing<br>

## Directory Structure

```
.
├── apps                         # Applications
│    ├── api                     # Edge API (Hono.js + Cloudflare Workers + D1)
│    ├── app                     # Main SaaS app (Next.js 14 App Router)
│    ├── web                     # Marketing website (Next.js 14)
│    └── ...
├── packages                     # Shared packages
│    ├── analytics               # OpenPanel analytics wrapper
│    ├── database               # Database schema & migrations (Drizzle)
│    ├── email                   # React Email templates
│    ├── kv                      # Upstash Redis rate limiting
│    ├── logger                  # Shared logging utilities
│    └── ui                      # Shared UI components (Shadcn UI)
├── tooling                      # Shared configurations
│    └── typescript              # TypeScript configs
├── .cursorrules                 # Cursor IDE rules
├── biome.json                   # Biome linter/formatter config
├── turbo.json                   # Turborepo config
├── bun.lockb                    # Bun lockfile
├── LICENSE
└── README.md
```

## Prerequisites

- [Bun](https://bun.sh/) (v1.1.26 or later)
- [Cloudflare account](https://cloudflare.com) (for Workers & D1)
- [Clerk account](https://clerk.com) (for authentication)
- [Upstash account](https://upstash.com) (for Redis rate limiting)
- [Resend account](https://resend.com) (for email delivery)
- [Sentry account](https://sentry.io) (optional, for error monitoring)
- [OpenPanel account](https://openpanel.dev) (optional, for analytics)

## Getting Started

Clone this repo locally with the following command:

```bash
git clone https://github.com/yusa-n/base-saas.git
cd base-saas
```

1. Install dependencies using bun:

```sh
bun i
```

2. Copy `.env.example` to `.env` and update the variables.

```sh
# Copy .env.example to .env for each app
cp apps/app/.env.example apps/app/.env
cp apps/api/.dev.vars.example apps/api/.dev.vars
cp apps/web/.env.example apps/web/.env
```

3. Set up services:

   **Clerk (Authentication):**
   - Create account at [clerk.com](https://clerk.com)
   - Create a new application
   - Copy API keys to `.env` files

   **Cloudflare (API & Database):**
   - Create account at [cloudflare.com](https://cloudflare.com)
   - Install Wrangler CLI: `bun add -g wrangler`
   - Authenticate: `wrangler login`
   - Create D1 database: `wrangler d1 create base-saas-db`
   - Update `wrangler.toml` with your database ID

   **Upstash (Rate Limiting):**
   - Create account at [upstash.com](https://upstash.com)
   - Create a Redis database
   - Copy credentials to `.env` files

4. Set up the database:

```sh
cd apps/api
bun run db:generate  # Generate migrations
bun run db:migrate   # Run migrations locally
```

5. Start the development server:

```sh
bun dev         # Start everything in development mode
bun dev:web     # Start marketing site (port 3001)
bun dev:app     # Start main app (port 3000)
bun dev:api     # Start API (port 8787)
bun dev:email   # Start email preview (port 3002)
```

## API Development

The API runs on Cloudflare Workers with Hono.js and uses D1 (SQLite) as the database:

```sh
cd apps/api

# Development
bun dev              # Start local development server

# Database management
bun db:generate      # Generate Drizzle migrations
bun db:migrate       # Apply migrations to local D1
bun db:studio        # Open Drizzle Studio (database GUI)

# Deployment
bun deploy           # Deploy to Cloudflare Workers

# Production database
wrangler d1 migrations apply base-saas-db --remote

# Set production secrets
wrangler secret put CLERK_PUBLISHABLE_KEY
wrangler secret put CLERK_SECRET_KEY
```

### API Architecture

- **Edge Runtime**: Runs globally on Cloudflare's edge network
- **Database**: D1 provides edge-native SQLite with automatic replication
- **ORM**: Drizzle ORM for type-safe database queries
- **Authentication**: Clerk middleware validates JWTs on every request
- **Rate Limiting**: Upstash Redis with fixed window strategy

## Key Features

### Edge-First Architecture
- API runs on Cloudflare Workers for minimal latency
- D1 database provides globally distributed SQLite
- Optimized for performance with Hono.js

### Modern Development Experience
- Type-safe from database to frontend with Drizzle + Zod
- Server Actions with automatic validation
- URL state management with nuqs
- Biome for fast linting and formatting

### Production Ready
- Authentication with Clerk (SSO, MFA, etc.)
- Rate limiting with Upstash Redis
- Error monitoring with Sentry
- Internationalization support
- Email templates with React Email

## Common Commands

```sh
# Development
bun dev          # Start all apps
bun dev:app      # Start main app only
bun dev:api      # Start API only
bun dev:web      # Start marketing site only

# Code quality
bun lint         # Lint with Biome
bun format       # Format with Biome
bun typecheck    # TypeScript checking

# Build
bun build        # Build all apps
bun clean        # Clean build artifacts
```

## Deployment

### Deploy Next.js Apps to Vercel

The web and app can be deployed to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyusa-n%2Fbase-saas)

### Deploy API to Cloudflare

```sh
cd apps/api
bun deploy

# Don't forget to set production secrets
wrangler secret put CLERK_PUBLISHABLE_KEY
wrangler secret put CLERK_SECRET_KEY

# Run production migrations
wrangler d1 migrations apply base-saas-db --remote
```

## Learn More

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [D1 Database Documentation](https://developers.cloudflare.com/d1/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Hono.js Documentation](https://hono.dev/)
- [Clerk Documentation](https://clerk.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
