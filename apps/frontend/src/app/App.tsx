import { ClerkProvider } from "@clerk/clerk-react";
import { RouterProvider } from "react-router-dom";

import { router } from "@/app/router";
import { ToastProvider } from "@/components/ui/toast";
import "@/i18n";

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? "pk_test_replace_me";

export function App() {
  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </ClerkProvider>
  );
}
