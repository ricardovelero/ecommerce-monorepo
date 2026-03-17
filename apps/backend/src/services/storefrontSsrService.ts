import path from "node:path";
import { pathToFileURL } from "node:url";

interface StorefrontRenderResult {
  appHtml: string;
  dehydratedState: unknown;
  statusCode: number;
}

interface StorefrontRendererModule {
  renderStorefront: (url: string, options: { apiBaseUrl: string }) => Promise<StorefrontRenderResult>;
}

const dynamicImport = new Function("specifier", "return import(specifier)") as <T>(specifier: string) => Promise<T>;

function serializeState(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function injectAppHtml(html: string, appHtml: string, dehydratedState: unknown): string {
  const rootMarkup = `<div id="root">${appHtml}</div>`;
  const dehydratedStateScript = `<script>window.__ECOMMERCE_DEHYDRATED_STATE__=${serializeState(dehydratedState)};</script>`;

  return html.replace(/<div id="root"><\/div>/, `${rootMarkup}\n    ${dehydratedStateScript}`);
}

export function createStorefrontSsrService(frontendDistPath: string, apiBaseUrl: string) {
  let rendererPromise: Promise<StorefrontRendererModule["renderStorefront"]> | null = null;
  const candidateEntryPaths = [
    path.join(frontendDistPath, "server", "entry-server.js"),
    path.resolve(frontendDistPath, "../../frontend/dist/server/entry-server.js"),
    path.resolve(frontendDistPath, "../../frontend/src/entry-server.tsx"),
  ];

  async function loadRendererModule(entryPath: string) {
    return (await dynamicImport<StorefrontRendererModule>(pathToFileURL(entryPath).href)) as StorefrontRendererModule;
  }

  async function getRenderer() {
    if (rendererPromise) {
      return rendererPromise;
    }

    rendererPromise = (async () => {
      let lastError: unknown = null;

      for (const entryPath of candidateEntryPaths) {
        try {
          const module = await loadRendererModule(entryPath);
          return module.renderStorefront;
        } catch (error) {
          const isMissingModule =
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            (error.code === "ERR_MODULE_NOT_FOUND" || error.code === "MODULE_NOT_FOUND" || error.code === "ENOENT");

          if (!isMissingModule) {
            throw error;
          }

          lastError = error;
        }
      }

      throw lastError ?? new Error("Storefront SSR renderer not found");
    })();

    return rendererPromise;
  }

  return {
    async render(url: string, templateHtml: string) {
      const renderStorefront = await getRenderer();
      const result = await renderStorefront(url, { apiBaseUrl });

      return {
        html: injectAppHtml(templateHtml, result.appHtml, result.dehydratedState),
        statusCode: result.statusCode,
      };
    },
  };
}
