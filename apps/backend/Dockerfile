FROM node:20-alpine AS build
WORKDIR /app
RUN corepack enable

COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=build /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=build /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=build /app/packages/shared-types/package.json ./packages/shared-types/package.json

RUN pnpm install --prod --filter @ecommerce/backend... --frozen-lockfile

COPY --from=build /app/apps/backend/dist ./apps/backend/dist
COPY --from=build /app/apps/backend/prisma ./apps/backend/prisma
COPY --from=build /app/apps/frontend/dist ./apps/backend/public
COPY --from=build /app/packages/shared-types/dist ./packages/shared-types/dist

WORKDIR /app/apps/backend
EXPOSE 4000
CMD ["node", "dist/server.js"]
