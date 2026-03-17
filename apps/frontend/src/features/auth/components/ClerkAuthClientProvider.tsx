import { useAuth, useClerk, useUser } from "@clerk/clerk-react";
import { useMemo } from "react";

import { AuthClientProvider } from "@/features/auth/hooks/useAuthClient";
import { ClerkAuthClient } from "@/features/auth/infrastructure/clerk/ClerkAuthClient";

export function ClerkAuthClientProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const clerk = useClerk();

  const authClient = useMemo(
    () =>
      new ClerkAuthClient({
        isSignedIn: Boolean(isSignedIn),
        getToken,
        user: user
          ? {
              id: user.id,
              emailAddresses: user.emailAddresses,
            }
          : null,
        openSignIn: () => clerk.openSignIn(),
        performSignOut: () => clerk.signOut(),
      }),
    [clerk, getToken, isSignedIn, user],
  );

  return <AuthClientProvider authClient={authClient}>{children}</AuthClientProvider>;
}
