# Ecommerce Monorepo

PNPM workspace monorepo for an e-commerce system with Stripe checkout, Clerk auth, Prisma/Postgres, and background processing using Redis + BullMQ.

## Workspace Structure

```text
ecommerce-monorepo/
  apps/
    backend/        # Express API
    frontend/       # React + Vite storefront/admin
    worker/         # BullMQ worker for Stripe/order jobs
  packages/
    shared-types/   # Shared frontend/backend DTOs
    queue/          # Shared queue names, payload types, and Redis helpers
  docker/
    postgres/
  docker-compose.yml
```

## Phase 5 Architecture (Redis + Worker)

### API responsibilities

- Create Stripe Checkout session (`POST /api/checkout/session`)
- Receive Stripe webhook (`POST /api/webhooks/stripe`)
- Validate Stripe webhook signature
- Record webhook event in DB (`WebhookEvent`)
- Enqueue background job to Redis queue (`order-processing`)
- Expose health endpoints:
  - `GET /health`
  - `GET /api/healthcheck` (DB + Redis dependency status)

### Worker responsibilities

Worker consumes BullMQ jobs and processes Stripe events:

- `checkout.session.completed`
  - fetch Stripe session
  - load cart
  - create order
  - decrement product stock
  - send confirmation email (Postmark)
- `payment_intent.payment_failed`
  - mark matching order as failed if still unpaid

Order creation flow is processed inside a Prisma transaction.

## Tech Stack

- Monorepo: pnpm workspaces
- Frontend: React 18, Vite, TypeScript, TanStack Query
- API: Express, TypeScript, Zod
- Worker: BullMQ, Redis, Prisma
- Database: PostgreSQL
- Payments: Stripe Checkout + Webhooks
- Auth: Clerk (frontend token + backend JWT verification)
- Email: Postmark
- Logging: Pino (`api` and `worker`)

## Data Model Update

`Product` now includes stock:

- `stock Int @default(0)`

Stock is decremented in worker transaction when payment is confirmed.

## Environment Variables

### Backend (`apps/backend/.env`)

Copy from example:

```bash
cp apps/backend/.env.example apps/backend/.env
```

Key vars:

- `PORT=4000`
- `DATABASE_URL=postgresql://ecommerce:ecommerce@localhost:5432/ecommerce?schema=public`
- `REDIS_URL=redis://localhost:6379`
- `STRIPE_SECRET_KEY=sk_test_...`
- `STRIPE_WEBHOOK_SECRET=whsec_...`
- `CLERK_JWKS_URL=...`
- `CLERK_ISSUER=...`
- `APP_URL=http://localhost:5173`
- `API_URL=http://localhost:4000`
- `POSTMARK_SERVER_TOKEN=...` (optional in local)
- `POSTMARK_FROM_EMAIL=...` (optional in local)

### Worker (`apps/worker/.env`)

Copy from example:

```bash
cp apps/worker/.env.example apps/worker/.env
```

Key vars:

- `DATABASE_URL=postgresql://ecommerce:ecommerce@localhost:5432/ecommerce?schema=public`
- `REDIS_URL=redis://localhost:6379`
- `STRIPE_SECRET_KEY=sk_test_...`
- `POSTMARK_SERVER_TOKEN=...` (optional)
- `POSTMARK_FROM_EMAIL=...` (optional)
- `WORKER_CONCURRENCY=5`

### Frontend (`apps/frontend/.env`)

```bash
cp apps/frontend/.env.example apps/frontend/.env
```

- `VITE_API_BASE_URL=http://localhost:4000`
- `VITE_CLERK_PUBLISHABLE_KEY=pk_test_replace_me`

## Run Locally (pnpm dev)

1. Install deps:

```bash
pnpm install
```

2. Start infrastructure (Postgres + Redis):

```bash
docker compose up -d postgres redis
```

3. Run DB migrations + seed:

```bash
pnpm prisma:migrate
pnpm prisma:seed
```

4. Start frontend + backend + worker:

```bash
pnpm dev
```

Services:

- Frontend: `http://localhost:5173`
- API: `http://localhost:4000`
- Health: `http://localhost:4000/api/healthcheck`

## Run Full Stack with Docker Compose

```bash
docker compose up --build
```

Compose services:

- `postgres`
- `redis`
- `api`
- `worker`

API and worker run `prisma migrate deploy` at startup.

## Stripe Local Webhook Test

1. Start stack (`pnpm dev` + DB/Redis).
2. Forward Stripe webhooks:

```bash
stripe listen --forward-to localhost:4000/api/webhooks/stripe
```

3. Put returned secret in backend env as `STRIPE_WEBHOOK_SECRET`.
4. Complete checkout in frontend with Stripe test card.
5. Verify:
   - webhook event is recorded
   - job is queued/processed
   - order appears in `/account/orders`
   - product stock is decremented

## Useful Commands

- `pnpm dev`: run backend + frontend + worker (+ queue package watch)
- `pnpm build`: build all workspaces
- `pnpm lint`: lint all workspaces
- `pnpm prisma:migrate`: run local Prisma migrations
- `pnpm prisma:seed`: seed local data
- `docker compose up --build`: run API + worker + Postgres + Redis
