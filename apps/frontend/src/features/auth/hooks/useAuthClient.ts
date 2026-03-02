import { useAuth, useClerk, useUser } from "@clerk/clerk-react";
import { useMemo } from "react";

import { ClerkAuthClient } from "@/features/auth/infrastructure/clerk/ClerkAuthClient";

export function useAuthClient() {
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const clerk = useClerk();

  return useMemo(
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
}
