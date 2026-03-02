import path from "node:path";

import cors from "cors";
import express from "express";
import morgan from "morgan";

import { env } from "@/config/env";
import { errorHandler } from "@/middleware/errorHandler";
import { requestId } from "@/middleware/requestId";
import { cartRoutes } from "@/routes/cartRoutes";
import { healthRoutes } from "@/routes/healthRoutes";
import { productRoutes } from "@/routes/productRoutes";

const app: express.Express = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(requestId);

app.use(healthRoutes);
app.use("/api", productRoutes);
app.use("/api", cartRoutes);

const frontendDistPath = path.resolve(__dirname, env.FRONTEND_DIST_PATH);

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
