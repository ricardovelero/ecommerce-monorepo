FROM node:20-alpine AS build
WORKDIR /app
RUN corepack enable

COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @ecommerce/frontend build

FROM nginx:1.27-alpine
COPY --from=build /app/apps/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
