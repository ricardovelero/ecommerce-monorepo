import { prisma } from "@/db/prisma";
import { env } from "@/config/env";

const PUBLIC_LANGS = ["es", "en"] as const;

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&apos;");
}

export function createSeoService(deps: {
  appUrl: string;
  prismaClient: {
    product: {
      findMany: (args: {
        select: {
          id: true;
          updatedAt: true;
        };
        orderBy: {
          updatedAt: "desc";
        };
      }) => Promise<Array<{ id: string; updatedAt: Date }>>;
    };
  };
} = {
  appUrl: env.APP_URL,
  prismaClient: prisma,
}) {
  function buildRobotsTxt(): string {
    return [`User-agent: *`, `Allow: /`, `Sitemap: ${deps.appUrl.replace(/\/$/, "")}/sitemap.xml`].join("\n");
  }

  async function buildSitemapXml(): Promise<string> {
    const products = await deps.prismaClient.product.findMany({
      select: {
        id: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const urls: Array<{ loc: string; lastmod?: string }> = [
      ...PUBLIC_LANGS.flatMap((lang) => [
        { loc: `/${lang}` },
        { loc: `/${lang}/products` },
      ]),
      ...products.flatMap((product) =>
        PUBLIC_LANGS.map((lang) => ({
          loc: `/${lang}/products/${product.id}`,
          lastmod: product.updatedAt.toISOString(),
        })),
      ),
    ];

    return [
      `<?xml version="1.0" encoding="UTF-8"?>`,
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
      ...urls.map((url) => {
        const lines = [`  <url>`, `    <loc>${escapeXml(new URL(url.loc, deps.appUrl).toString())}</loc>`];
        if (url.lastmod) {
          lines.push(`    <lastmod>${escapeXml(url.lastmod)}</lastmod>`);
        }
        lines.push(`  </url>`);
        return lines.join("\n");
      }),
      `</urlset>`,
    ].join("\n");
  }

  return {
    buildRobotsTxt,
    buildSitemapXml,
  };
}

const seoService = createSeoService();

export function getRobotsTxt(): string {
  return seoService.buildRobotsTxt();
}

export async function getSitemapXml(): Promise<string> {
  return seoService.buildSitemapXml();
}
