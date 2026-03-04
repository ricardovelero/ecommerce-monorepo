import { Router } from "express";

import { getHealth } from "@/controllers/healthController";

export const healthRoutes: Router = Router();

healthRoutes.get("/health", getHealth);
healthRoutes.get("/api/healthcheck", getHealth);
