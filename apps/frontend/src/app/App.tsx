import { ClerkProvider } from "@clerk/clerk-react";
import type { DehydratedState } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import { BrowserRouter } from "react-router-dom";

import { AppRoutes } from "@/app/routes";
import { ToastProvider } from "@/components/ui/toast";
import { AuthSyncProvider } from "@/features/auth/components/AuthSyncProvider";
import { ClerkAuthClientProvider } from "@/features/auth/components/ClerkAuthClientProvider";
import i18n from "@/i18n";
import { AppErrorBoundary } from "@/providers/AppErrorBoundary";
import { QueryProvider } from "@/providers/QueryProvider";

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? "pk_test_replace_me";

export function App({ dehydratedState }: { dehydratedState?: DehydratedState }) {
  return (
    <AppErrorBoundary>
      <I18nextProvider i18n={i18n}>
        <ClerkProvider publishableKey={clerkPublishableKey}>
          <ClerkAuthClientProvider>
            <QueryProvider dehydratedState={dehydratedState}>
              <AuthSyncProvider>
                <ToastProvider>
                  <BrowserRouter>
                    <AppRoutes />
                  </BrowserRouter>
                </ToastProvider>
              </AuthSyncProvider>
            </QueryProvider>
          </ClerkAuthClientProvider>
        </ClerkProvider>
      </I18nextProvider>
    </AppErrorBoundary>
  );
}
