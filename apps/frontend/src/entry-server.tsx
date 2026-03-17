import { dehydrate, QueryClient } from "@tanstack/react-query";
import { renderToString } from "react-dom/server";
import { I18nextProvider } from "react-i18next";
import { StaticRouter } from "react-router-dom/server";

import { StorefrontRoutes } from "@/app/routes";
import { ToastProvider } from "@/components/ui/toast";
import { AuthClientProvider } from "@/features/auth/hooks/useAuthClient";
import { AnonymousAuthClient } from "@/features/auth/infrastructure/AnonymousAuthClient";
import { getHomeMerchandisingQueryOptions } from "@/features/merchandising/hooks/useHomeMerchandising";
import { getProductQueryOptions } from "@/features/products/hooks/useProduct";
import { getProductsQueryOptions } from "@/features/products/hooks/useProducts";
import type { ApiGetClient } from "@/features/shared/api/ApiClient";
import { createAppI18n, resolveLanguage } from "@/i18n";
import { AppErrorBoundary } from "@/providers/AppErrorBoundary";
import { QueryProvider } from "@/providers/QueryProvider";

class ServerApiClient implements ApiGetClient {
  constructor(private readonly baseUrl: string) {}

  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`);

    if (!response.ok) {
      const error = new Error(await response.text()) as Error & { status?: number };
      error.status = response.status;
      throw error;
    }

    return (await response.json()) as T;
  }
}

function parseProductsQuery(url: URL) {
  const parsedPage = Number(url.searchParams.get("page") ?? "1");

  return {
    search: url.searchParams.get("search") ?? undefined,
    categoryId: url.searchParams.get("categoryId") ?? undefined,
    sort: (url.searchParams.get("sort") as "newest" | "price_asc" | "price_desc" | "name_asc" | null) ?? "newest",
    page: Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1,
    pageSize: 9,
  } as const;
}

async function prefetchRouteData(queryClient: QueryClient, apiClient: ApiGetClient, requestUrl: URL) {
  const [maybeLang, section, maybeProductId] = requestUrl.pathname.split("/").filter(Boolean);
  const lang = resolveLanguage(maybeLang);

  if (!maybeLang || lang !== maybeLang) {
    return { lang, statusCode: 302 };
  }

  if (!section) {
    await queryClient.prefetchQuery(getHomeMerchandisingQueryOptions(apiClient));
    return { lang, statusCode: 200 };
  }

  if (section !== "products") {
    return { lang, statusCode: 404 };
  }

  if (!maybeProductId) {
    await queryClient.prefetchQuery(getProductsQueryOptions(apiClient, parseProductsQuery(requestUrl)));
    return { lang, statusCode: 200 };
  }

  try {
    await queryClient.fetchQuery(getProductQueryOptions(apiClient, maybeProductId, "guest"));
    return { lang, statusCode: 200 };
  } catch (error) {
    const statusCode = typeof error === "object" && error !== null && "status" in error && error.status === 404 ? 404 : 500;
    return { lang, statusCode };
  }
}

export async function renderStorefront(url: string, options: { apiBaseUrl: string }) {
  const requestUrl = new URL(url, "http://storefront.local");
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 30_000,
      },
    },
  });
  const apiClient = new ServerApiClient(options.apiBaseUrl);
  const { lang, statusCode } = await prefetchRouteData(queryClient, apiClient, requestUrl);
  const i18n = createAppI18n(lang);
  const authClient = new AnonymousAuthClient();

  const appHtml = renderToString(
    <AppErrorBoundary>
      <I18nextProvider i18n={i18n}>
        <AuthClientProvider authClient={authClient}>
          <QueryProvider client={queryClient} dehydratedState={dehydrate(queryClient)} persistCartCache={false}>
            <ToastProvider>
              <StaticRouter location={requestUrl.pathname + requestUrl.search}>
                <StorefrontRoutes />
              </StaticRouter>
            </ToastProvider>
          </QueryProvider>
        </AuthClientProvider>
      </I18nextProvider>
    </AppErrorBoundary>,
  );

  return {
    appHtml,
    dehydratedState: dehydrate(queryClient),
    statusCode,
  };
}
