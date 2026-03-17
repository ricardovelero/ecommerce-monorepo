import { Router } from "express";

import { env } from "@/config/env";
import { logger } from "@/lib/logger";
import { getProductById } from "@/services/productService";
import { createSeoHtmlService, createTemplateHtmlLoader } from "@/services/seoHtmlService";
import { createStorefrontSsrService } from "@/services/storefrontSsrService";
import { asyncHandler } from "@/utils/asyncHandler";

const PUBLIC_LANGS = new Set(["es", "en"]);

function isPublicLang(value: string): value is "es" | "en" {
  return PUBLIC_LANGS.has(value);
}

export function createStorefrontSeoRoutes(frontendDistPath: string): Router {
  const router = Router();
  const getTemplateHtml = createTemplateHtmlLoader(frontendDistPath);
  const seoHtmlService = createSeoHtmlService({
    appUrl: env.APP_URL,
    getTemplateHtml,
    getProductById,
  });
  const storefrontSsrService = createStorefrontSsrService(frontendDistPath, env.API_URL);

  async function renderWithStorefrontSsr(url: string, html: string) {
    try {
      return await storefrontSsrService.render(url, html);
    } catch (error) {
      logger.warn({ err: error, url }, "Storefront SSR failed; falling back to SEO HTML shell only");
      return { html };
    }
  }

  router.get(
    "/:lang",
    asyncHandler(async (req, res, next) => {
      if (!isPublicLang(req.params.lang)) {
        next();
        return;
      }

      const response = await seoHtmlService.renderHomePage(req.params.lang);
      const rendered = await renderWithStorefrontSsr(req.originalUrl, response.html);
      res.status(response.statusCode).send(rendered.html);
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
      const rendered = await renderWithStorefrontSsr(req.originalUrl, response.html);
      res.status(response.statusCode).send(rendered.html);
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
      const rendered = await renderWithStorefrontSsr(req.originalUrl, response.html);
      res.status(response.statusCode).send(rendered.html);
    }),
  );

  return router;
}
