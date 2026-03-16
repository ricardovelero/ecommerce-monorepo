import path from "node:path";

import cors from "cors";
import express from "express";
import pinoHttp from "pino-http";

import { createCorsOptions, parseAllowedOrigins } from "@/config/cors";
import { env } from "@/config/env";
import { logger } from "@/lib/logger";
import { errorHandler } from "@/middleware/errorHandler";
import { requestId } from "@/middleware/requestId";
import { adminRoutes } from "@/routes/adminRoutes";
import { authRoutes } from "@/routes/authRoutes";
import { cartRoutes } from "@/routes/cartRoutes";
import { checkoutRoutes } from "@/routes/checkoutRoutes";
import { healthRoutes } from "@/routes/healthRoutes";
import { merchandisingRoutes } from "@/routes/merchandisingRoutes";
import { orderRoutes } from "@/routes/orderRoutes";
import { productRoutes } from "@/routes/productRoutes";
import { seoRoutes } from "@/routes/seoRoutes";
import { createStorefrontSeoRoutes } from "@/routes/storefrontSeoRoutes";
import { stripeWebhookRoutes } from "@/routes/stripeWebhookRoutes";

const app: express.Express = express();
const allowedOrigins = parseAllowedOrigins(env.CORS_ALLOWED_ORIGINS, env.APP_URL);

app.use(cors(createCorsOptions(allowedOrigins)));
app.use(requestId);
app.use(
  pinoHttp({
    logger,
    customProps: (req) => ({
      requestId: req.requestId,
    }),
  }),
);
app.use("/api/webhooks/stripe", stripeWebhookRoutes);
app.use(express.json());

app.use(healthRoutes);
app.use(seoRoutes);
app.use("/api", merchandisingRoutes);
app.use("/api", productRoutes);
app.use("/api", cartRoutes);
app.use("/api", authRoutes);
app.use("/api", checkoutRoutes);
app.use("/api", orderRoutes);
app.use("/api", adminRoutes);

const frontendDistPath = path.resolve(__dirname, env.FRONTEND_DIST_PATH);

app.use(createStorefrontSeoRoutes(frontendDistPath));
app.use(express.static(frontendDistPath));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api") || req.path === "/health") {
    next();
    return;
  }
  res.sendFile(path.join(frontendDistPath, "index.html"), (err) => {
    if (err) {
      next();
    }
  });
});

app.use(errorHandler);

export { app };
