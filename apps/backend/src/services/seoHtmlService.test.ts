import assert from "node:assert/strict";
import test from "node:test";

import { createSeoHtmlService } from "@/services/seoHtmlService";
import { HttpError } from "@/utils/httpError";

const TEMPLATE = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="base description" />
    <title>Base title</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

test("renderHomePage injects route-specific SEO tags into the HTML shell", async () => {
  const service = createSeoHtmlService({
    appUrl: "https://shop.example.com",
    getTemplateHtml: async () => TEMPLATE,
    getProductById: async () => {
      throw new Error("not used");
    },
  });

  const response = await service.renderHomePage("es");

  assert.equal(response.statusCode, 200);
  assert.match(response.html, /<title>Sol iO \| Productos destacados, más vendidos y novedades<\/title>/);
  assert.match(response.html, /<link rel="canonical" href="https:\/\/shop\.example\.com\/es" \/>/);
  assert.match(response.html, /<meta property="og:title" content="Sol iO \| Productos destacados, más vendidos y novedades" \/>/);
});

test("renderProductDetailPage injects product metadata and returns 404 metadata when product is missing", async () => {
  const service = createSeoHtmlService({
    appUrl: "https://shop.example.com",
    getTemplateHtml: async () => TEMPLATE,
    getProductById: async (productId) => {
      if (productId === "prod_123") {
        return {
          id: "prod_123",
          name: "Hydrating Serum",
          description: "Lightweight serum for daily hydration.",
          imageUrl: "https://cdn.example.com/product.jpg",
        };
      }

      throw new HttpError(404, "Product not found");
    },
  });

  const found = await service.renderProductDetailPage("en", "prod_123");
  const missing = await service.renderProductDetailPage("en", "missing");

  assert.equal(found.statusCode, 200);
  assert.match(found.html, /<title>Hydrating Serum \| Sol iO<\/title>/);
  assert.match(found.html, /<meta property="og:image" content="https:\/\/cdn\.example\.com\/product\.jpg" \/>/);

  assert.equal(missing.statusCode, 404);
  assert.match(missing.html, /<meta name="robots" content="noindex,nofollow" \/>/);
});
