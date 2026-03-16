import { Router } from "express";

import { env } from "@/config/env";
import { getProductById } from "@/services/productService";
import { createSeoHtmlService, createTemplateHtmlLoader } from "@/services/seoHtmlService";
import { asyncHandler } from "@/utils/asyncHandler";

const PUBLIC_LANGS = new Set(["es", "en"]);

function isPublicLang(value: string): value is "es" | "en" {
  return PUBLIC_LANGS.has(value);
}

export function createStorefrontSeoRoutes(frontendDistPath: string): Router {
  const router = Router();
  const seoHtmlService = createSeoHtmlService({
    appUrl: env.APP_URL,
    getTemplateHtml: createTemplateHtmlLoader(frontendDistPath),
    getProductById,
  });

  router.get(
    "/:lang",
    asyncHandler(async (req, res, next) => {
      if (!isPublicLang(req.params.lang)) {
        next();
        return;
      }

      const response = await seoHtmlService.renderHomePage(req.params.lang);
      res.status(response.statusCode).send(response.html);
    }),
  );

  router.get(
    "/:lang/products",
    asyncHandler(async (req, res, next) => {
      if (!isPublicLang(req.params.lang)) {
        next();
        return;
      }

      const response = await seoHtmlService.renderProductsPage(req.params.lang);
      res.status(response.statusCode).send(response.html);
    }),
  );

  router.get(
    "/:lang/products/:id",
    asyncHandler(async (req, res, next) => {
      if (!isPublicLang(req.params.lang)) {
        next();
        return;
      }

      const response = await seoHtmlService.renderProductDetailPage(req.params.lang, req.params.id);
      res.status(response.statusCode).send(response.html);
    }),
  );

  return router;
}
