# Ecommerce Monorepo

Production-ready pnpm monorepo for an e-commerce showcase.

## Architecture Overview

The project is organized as a workspace monorepo:

- `apps/frontend`: React + Vite storefront/admin UI.
- `apps/backend`: Express API with Prisma + PostgreSQL.
- `packages/shared-types`: shared DTOs and domain types used by both apps.

Frontend follows a feature-first structure:

- `src/features/products`
- `src/features/cart`
- `src/features/orders`
- `src/features/admin`
- `src/features/auth`
- shared app providers in `src/providers`

Data layer is centralized with TanStack Query and feature-level hooks (`features/*/hooks`) so components do not call `fetch` directly.

## Tech Stack

- Monorepo: pnpm workspaces
- Frontend: React 18, Vite 6, TypeScript, Tailwind, shadcn-style components, TanStack Query, react-i18next
- Auth (frontend): Clerk via local auth abstraction (`AuthClient`)
- Backend: Node.js, Express, TypeScript, Prisma, Zod, JOSE
- Database: PostgreSQL
- Payments: Stripe Checkout + Webhook order confirmation

## Auth Flow

1. User authenticates through Clerk in frontend.
2. Frontend obtains JWT with Clerk SDK (`getToken`).
3. API client sends `Authorization: Bearer <token>`.
4. Backend verifies JWT with JOSE middleware.
5. RBAC middleware (`requireRole`) protects admin API routes.

Frontend admin routes are additionally guarded with `RequireRole`.

## Stripe Checkout Flow

1. User opens cart and clicks checkout.
2. Frontend calls `POST /api/checkout/session`.
3. Backend creates Stripe Checkout session and returns redirect URL.
4. Frontend redirects browser to Stripe-hosted checkout.
5. Stripe webhook confirms payment and creates/updates order server-side.
6. User returns to `/checkout/success`, then can open `/account/orders`.

## Repository Structure

```text
ecommerce-monorepo/
  apps/
    backend/
    frontend/
  packages/
    shared-types/
  docker/
    postgres/
  docker-compose.yml
  pnpm-workspace.yaml
```

## Prerequisites

- Node.js 20+
- pnpm 10+
- Docker + Docker Compose
- Stripe CLI (for local webhook forwarding)

## Environment Variables

Copy example files:

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
```

Backend (`apps/backend/.env`) minimum values:

- `PORT=4000`
- `DATABASE_URL=postgresql://ecommerce:ecommerce@localhost:5432/ecommerce?schema=public`
- `ADMIN_EMAIL=admin@example.com`
- `CLERK_JWKS_URL=...`
- `CLERK_ISSUER=...`
- `STRIPE_SECRET_KEY=sk_test_...`
- `STRIPE_WEBHOOK_SECRET=whsec_...`
- `APP_URL=http://localhost:5173`
- `API_URL=http://localhost:4000`

Frontend (`apps/frontend/.env`):

- `VITE_API_BASE_URL=http://localhost:4000`
- `VITE_CLERK_PUBLISHABLE_KEY=pk_test_replace_me`

## Run Locally

```bash
pnpm install
pnpm db:up
pnpm prisma:migrate
pnpm prisma:seed
pnpm dev
```

Apps:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`

## Test Checkout Locally

1. Start apps and DB (`pnpm dev` + `pnpm db:up`).
2. In a separate terminal forward Stripe webhooks:

```bash
stripe listen --forward-to localhost:4000/api/webhooks/stripe
```

3. Copy returned webhook secret into `apps/backend/.env` as `STRIPE_WEBHOOK_SECRET`.
4. Sign in, add products to cart, and start checkout.
5. Complete payment with Stripe test card values.
6. Confirm redirect to `/checkout/success` and verify order in `/account/orders`.

## Screenshots

Add screenshots here after running locally:

- `docs/screenshots/storefront.png` (storefront)
- `docs/screenshots/cart.png` (cart)
- `docs/screenshots/checkout.png` (checkout)
- `docs/screenshots/admin-dashboard.png` (admin dashboard)

## Useful Commands

- `pnpm dev`: run backend + frontend
- `pnpm build`: build all packages/apps
- `pnpm --filter @ecommerce/frontend lint`: lint frontend
- `pnpm --filter @ecommerce/frontend build`: typecheck + build frontend
- `pnpm db:up`: start Postgres
- `pnpm db:down`: stop Postgres
- `pnpm prisma:migrate`: apply backend migrations
- `pnpm prisma:seed`: seed initial data
