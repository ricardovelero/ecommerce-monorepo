import { readFile } from "node:fs/promises";
import path from "node:path";

import { HttpError } from "@/utils/httpError";

type PublicLang = "es" | "en";

interface SeoMetadata {
  title: string;
  description: string;
  canonicalPath: string;
  robots?: string;
  ogType?: string;
  imageUrl?: string | null;
}

const SITE_NAME = "Sol iO";

const SEO_COPY: Record<
  PublicLang,
  {
    home: {
      title: string;
      description: string;
    };
    products: {
      title: string;
      description: string;
    };
    productFallback: {
      title: string;
      description: string;
    };
  }
> = {
  en: {
    home: {
      title: "Sol iO | Featured products, best sellers, and new arrivals",
      description: "Explore Sol iO featured products, current best sellers, and the latest arrivals in one curated storefront.",
    },
    products: {
      title: "Products | Sol iO",
      description: "Browse the Sol iO product catalog with featured items, pricing, and category filters.",
    },
    productFallback: {
      title: "Product details | Sol iO",
      description: "Discover product details, pricing, and availability from the Sol iO catalog.",
    },
  },
  es: {
    home: {
      title: "Sol iO | Productos destacados, más vendidos y novedades",
      description: "Explora en Sol iO los productos destacados, los más vendidos y las últimas novedades en una storefront curada.",
    },
    products: {
      title: "Productos | Sol iO",
      description: "Recorre el catálogo de Sol iO con productos destacados, precios y filtros por categoría.",
    },
    productFallback: {
      title: "Detalle de producto | Sol iO",
      description: "Descubre detalles, precio y disponibilidad de productos del catálogo de Sol iO.",
    },
  },
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

function stripTags(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function trimDescription(value: string, maxLength = 160): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).trimEnd()}…`;
}

function replaceOrInsertTag(html: string, pattern: RegExp, replacement: string): string {
  if (pattern.test(html)) {
    return html.replace(pattern, replacement);
  }

  return html.replace("</head>", `  ${replacement}\n  </head>`);
}

function buildSeoHead(metadata: SeoMetadata, appUrl: string): string {
  const canonicalUrl = new URL(metadata.canonicalPath, appUrl).toString();
  const tags = [
    `<meta name="description" content="${escapeHtml(metadata.description)}" />`,
    `<meta name="robots" content="${escapeHtml(metadata.robots ?? "index,follow")}" />`,
    `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`,
    `<meta property="og:title" content="${escapeHtml(metadata.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(metadata.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`,
    `<meta property="og:type" content="${escapeHtml(metadata.ogType ?? "website")}" />`,
    `<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />`,
  ];

  if (metadata.imageUrl) {
    tags.push(`<meta property="og:image" content="${escapeHtml(metadata.imageUrl)}" />`);
  }

  return tags.join("\n  ");
}

function injectSeoIntoHtml(templateHtml: string, metadata: SeoMetadata, appUrl: string): string {
  let html = templateHtml.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(metadata.title)}</title>`);

  html = replaceOrInsertTag(
    html,
    /<meta\s+name=["']description["'][^>]*>/i,
    `<meta name="description" content="${escapeHtml(metadata.description)}" />`,
  );
  html = html.replace(/<meta\s+name=["']robots["'][^>]*>\s*/gi, "");
  html = html.replace(/<link\s+rel=["']canonical["'][^>]*>\s*/gi, "");
  html = html.replace(/<meta\s+property=["']og:[^"']+["'][^>]*>\s*/gi, "");
  html = html.replace("</head>", `  ${buildSeoHead(metadata, appUrl)}\n</head>`);

  return html;
}

export function createSeoHtmlService(deps: {
  appUrl: string;
  getTemplateHtml: () => Promise<string>;
  getProductById: (id: string) => Promise<{
    id: string;
    name: string;
    description: string;
    imageUrl?: string | null;
  }>;
}) {
  return {
    async renderHomePage(lang: PublicLang): Promise<{ html: string; statusCode: number }> {
      const metadata = {
        ...SEO_COPY[lang].home,
        canonicalPath: `/${lang}`,
      } satisfies SeoMetadata;

      return {
        html: injectSeoIntoHtml(await deps.getTemplateHtml(), metadata, deps.appUrl),
        statusCode: 200,
      };
    },

    async renderProductsPage(lang: PublicLang): Promise<{ html: string; statusCode: number }> {
      const metadata = {
        ...SEO_COPY[lang].products,
        canonicalPath: `/${lang}/products`,
      } satisfies SeoMetadata;

      return {
        html: injectSeoIntoHtml(await deps.getTemplateHtml(), metadata, deps.appUrl),
        statusCode: 200,
      };
    },

    async renderProductDetailPage(lang: PublicLang, productId: string): Promise<{ html: string; statusCode: number }> {
      try {
        const product = await deps.getProductById(productId);
        const metadata = {
          title: `${product.name} | ${SITE_NAME}`,
          description: trimDescription(stripTags(product.description)),
          canonicalPath: `/${lang}/products/${product.id}`,
          ogType: "product",
          imageUrl: product.imageUrl ?? null,
        } satisfies SeoMetadata;

        return {
          html: injectSeoIntoHtml(await deps.getTemplateHtml(), metadata, deps.appUrl),
          statusCode: 200,
        };
      } catch (error) {
        if (!(error instanceof HttpError) || error.statusCode !== 404) {
          throw error;
        }

        const metadata = {
          ...SEO_COPY[lang].productFallback,
          canonicalPath: `/${lang}/products/${productId}`,
          robots: "noindex,nofollow",
        } satisfies SeoMetadata;

        return {
          html: injectSeoIntoHtml(await deps.getTemplateHtml(), metadata, deps.appUrl),
          statusCode: 404,
        };
      }
    },
  };
}

export function createTemplateHtmlLoader(frontendDistPath: string) {
  let cachedTemplate: string | null = null;

  return async () => {
    if (cachedTemplate !== null) {
      return cachedTemplate;
    }

    cachedTemplate = await readFile(path.join(frontendDistPath, "index.html"), "utf8");
    return cachedTemplate;
  };
}
