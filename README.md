# Ecommerce Monorepo (Phase 1)

Production-ready monorepo skeleton for a small e-commerce app using `pnpm` workspaces.

## Stack
- Monorepo: pnpm workspaces
- Frontend: Vite + React + TypeScript + Tailwind + shadcn-style UI
- Backend: Node + Express + TypeScript + Prisma + Zod
- DB (local): Postgres via `docker compose`
- Shared package: `packages/shared-types`

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
  package.json
  .editorconfig
  .gitignore
  README.md
```

## Prerequisites
- Node.js 20+
- pnpm 10+
- Docker + Docker Compose

## Environment Variables

Copy the example files:

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
```

Backend (`apps/backend/.env`):
- `PORT=4000`
- `DATABASE_URL=postgresql://ecommerce:ecommerce@localhost:5432/ecommerce?schema=public`
- `FRONTEND_DIST_PATH=../public`

Frontend (`apps/frontend/.env`):
- `VITE_API_BASE_URL=http://localhost:4000`
- `VITE_CLERK_PUBLISHABLE_KEY=pk_test_replace_me`

## Local Development

From monorepo root:

```bash
pnpm install
pnpm db:up
pnpm prisma:migrate
pnpm prisma:seed
pnpm dev
```

Apps:
- Frontend: http://localhost:5173
- Backend: http://localhost:4000
- Health check: http://localhost:4000/health

## Available Scripts

At root:
- `pnpm dev` runs backend + frontend in parallel
- `pnpm build` builds shared types + backend + frontend
- `pnpm db:up` starts local Postgres
- `pnpm db:down` stops Postgres
- `pnpm prisma:migrate` runs backend migration
- `pnpm prisma:seed` seeds 2 categories and 6 products

## API Endpoints
- `GET /health`
- `GET /api/products`
- `GET /api/products/:id`
- `GET /api/cart`
  - Uses optional auth and returns a dev empty cart when no auth token is present.
- `POST /api/cart/items`
- `DELETE /api/cart/items/:id`

## Auth Boundary (Frontend)

Auth abstraction lives in:
- `src/features/auth/domain/AuthClient.ts`
- `src/features/auth/infrastructure/clerk/ClerkAuthClient.ts`
- `src/features/auth/hooks/useAuthClient.ts`

Outside this feature (and app root provider), no module imports Clerk directly.

## i18n Routing
- `/` redirects to `/es`
- `/es/*` and `/en/*` route groups
- `react-i18next` with `es` and `en` translation files
- Language switcher updates URL prefix

## Docker

### Local DB only (selected for simplicity)
`docker-compose.yml` runs only Postgres for local development.

### Frontend image

```bash
docker build -f apps/frontend/Dockerfile -t ecommerce-frontend .
```

### Single-container backend + frontend image (Cloud Run ready)

Backend Dockerfile builds whole monorepo, compiles frontend, and serves frontend assets from Express static:

```bash
docker build -f apps/backend/Dockerfile -t ecommerce-app .
```

Run container:

```bash
docker run --rm -p 4000:4000 \
  -e PORT=4000 \
  -e DATABASE_URL='postgresql://ecommerce:ecommerce@host.docker.internal:5432/ecommerce?schema=public' \
  ecommerce-app
```

## Deployment Notes (Google Cloud Run)
1. Build and push backend image (`apps/backend/Dockerfile`) to Artifact Registry.
2. Deploy Cloud Run service on port `4000`.
3. Set environment variables in Cloud Run:
   - `PORT=4000`
   - `DATABASE_URL=<Cloud SQL or managed Postgres URL>`
   - `NODE_ENV=production`
4. If using Cloud SQL, configure private networking or Cloud SQL connector.
5. Configure Clerk publishable key in frontend build pipeline if building frontend separately.

## Phase 1 Scope
Included:
- Monorepo architecture
- Product and cart API skeleton
- Prisma models and seed data
- Frontend pages: Home, Products, Product Detail, Cart, Account, Admin placeholder
- i18n and auth abstraction

Not included:
- Admin features and RBAC (Phase 2)
- Payment workflow
- Order lifecycle
