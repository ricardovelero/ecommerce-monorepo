import express, { Router } from "express";

import { stripeWebhookController } from "@/controllers/stripeWebhookController";
import { asyncHandler } from "@/utils/asyncHandler";

export const stripeWebhookRoutes: Router = Router();

stripeWebhookRoutes.post("/", express.raw({ type: "application/json" }), asyncHandler(stripeWebhookController));
