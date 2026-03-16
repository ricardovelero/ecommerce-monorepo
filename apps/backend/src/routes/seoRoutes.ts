import { Router } from "express";

import { getRobotsController, getSitemapController } from "@/controllers/seoController";
import { asyncHandler } from "@/utils/asyncHandler";

export const seoRoutes: Router = Router();

seoRoutes.get("/robots.txt", getRobotsController);
seoRoutes.get("/sitemap.xml", asyncHandler(getSitemapController));
