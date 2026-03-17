import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import type { DehydratedState } from "@tanstack/react-query";
import { HydrationBoundary, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import type { ReactNode } from "react";
import { useState } from "react";

function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 30_000,
      },
    },
  });
}

export function QueryProvider({
  children,
  client: providedClient,
  dehydratedState,
  persistCartCache = typeof window !== "undefined",
}: {
  children: ReactNode;
  client?: QueryClient;
  dehydratedState?: DehydratedState;
  persistCartCache?: boolean;
}) {
  const [client] = useState(
    () => providedClient ?? createAppQueryClient(),
  );

  const [persister] = useState(() =>
    persistCartCache && typeof window !== "undefined"
      ? createSyncStoragePersister({
          storage: window.localStorage,
          key: "ecommerce-query-cache-v1",
        })
      : null,
  );

  const content = <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>;

  if (!persistCartCache || !persister) {
    return <QueryClientProvider client={client}>{content}</QueryClientProvider>;
  }

  return (
    <PersistQueryClientProvider
      client={client}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24,
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => query.queryKey[0] === "cart",
        },
      }}
    >
      {content}
    </PersistQueryClientProvider>
  );
}
