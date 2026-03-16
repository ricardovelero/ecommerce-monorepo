import assert from "node:assert/strict";
import test from "node:test";

import { createSeoService } from "@/services/seoService";

test("buildRobotsTxt points crawlers to the sitemap", () => {
  const service = createSeoService({
    appUrl: "https://shop.example.com",
    prismaClient: {
      product: {
        async findMany() {
          return [];
        },
      },
    },
  });

  assert.equal(
    service.buildRobotsTxt(),
    ["User-agent: *", "Allow: /", "Sitemap: https://shop.example.com/sitemap.xml"].join("\n"),
  );
});

test("buildSitemapXml includes localized storefront and product URLs", async () => {
  const service = createSeoService({
    appUrl: "https://shop.example.com",
    prismaClient: {
      product: {
        async findMany() {
          return [{ id: "prod_123", updatedAt: new Date("2026-03-16T12:00:00.000Z") }];
        },
      },
    },
  });

  const sitemap = await service.buildSitemapXml();

  assert.match(sitemap, /https:\/\/shop\.example\.com\/es/);
  assert.match(sitemap, /https:\/\/shop\.example\.com\/en\/products/);
  assert.match(sitemap, /https:\/\/shop\.example\.com\/es\/products\/prod_123/);
  assert.match(sitemap, /2026-03-16T12:00:00\.000Z/);
});
