# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a production-ready SaaS starter kit based on Midday, built as a Turborepo monorepo with Next.js 14, TypeScript, and modern tooling.

## Common Development Commands

### Development
```bash
# Install dependencies (using Bun)
bun i

# Start all apps in development mode
bun dev

# Start specific apps
bun dev:web    # Marketing site (port 3001)
bun dev:app    # Main app (port 3000)

# Deploy API to Cloudflare Workers
cd apps/api && bun run deploy
```

### Code Quality
```bash
# Lint entire codebase
bun lint

# Format code with Biome
bun format

# Type checking
bun typecheck

# Fix linting issues with Sherif
bun lint:repo:fix
```

### Build & Clean
```bash
# Build all apps
bun build

# Clean all build artifacts
bun clean

# Clean workspaces
bun clean:workspaces
```

## Architecture

### Monorepo Structure
- **apps/api**: Hono.js API running on Cloudflare Workers with Clerk authentication
- **apps/app**: Main SaaS application (Next.js 14 App Router, Clerk auth, i18n)
- **apps/web**: Marketing website (Next.js 14 App Router)
- **packages/ui**: Shared UI components based on Shadcn UI
- **packages/analytics**: OpenPanel analytics wrapper
- **packages/email**: React Email templates
- **packages/kv**: Upstash Redis rate limiting utilities
- **packages/logger**: Shared logging utilities
- **tooling/typescript**: Shared TypeScript configurations

### Key Patterns

#### Server Actions with Validation
```typescript
// Use react-safe-action with Zod schemas
export const myAction = authActionClient
  .schema(mySchema)
  .action(async ({ parsedInput, ctx }) => {
    // Handle business logic
  });
```

#### Internationalization
The app uses next-international with locales defined in `src/locales/`:
- Dynamic routing: `app/[locale]/(dashboard)`
- Server/client locale utilities in `locales/server.ts` and `locales/client.ts`

#### Authentication Flow
- Clerk handles auth for the main app
- API uses Clerk backend SDK with Hono middleware
- Middleware in `apps/app/src/middleware.ts` protects routes

#### Rate Limiting
Upstash Redis integration for API rate limiting:
```typescript
import { ratelimit } from "@v2/kv/ratelimit";
// Check rate limits before processing
```

### UI Development Guidelines
- Use Shadcn UI components from `@v2/ui`
- Follow mobile-first responsive design with Tailwind CSS
- Minimize client components - prefer RSC
- Wrap client components in Suspense boundaries
- Use `nuqs` for URL state management

### Environment Variables
Each app has its own `.env` file. Key services:
- **Clerk**: Authentication
- **Upstash**: Redis for rate limiting
- **Resend**: Email delivery
- **Sentry**: Error monitoring
- **OpenPanel**: Analytics
- **Dub**: Link shortening

### TypeScript Configuration
- Shared configs in `tooling/typescript/`
- Each package extends the appropriate base config
- Strict mode enabled with functional programming patterns

## Code Style (from .cursorrules)
- Functional TypeScript with interfaces over types
- No classes, prefer functional components
- Descriptive names with auxiliary verbs (isLoading, hasError)
- Early returns and guard clauses
- Zod for validation
- Model errors as return values in Server Actions