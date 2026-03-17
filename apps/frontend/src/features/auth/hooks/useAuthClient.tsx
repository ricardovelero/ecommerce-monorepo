import { createContext, useContext } from "react";

import type { AuthClient } from "@/features/auth/domain/AuthClient";

const AuthClientContext = createContext<AuthClient | null>(null);

export function AuthClientProvider({
  authClient,
  children,
}: {
  authClient: AuthClient;
  children: React.ReactNode;
}) {
  return <AuthClientContext.Provider value={authClient}>{children}</AuthClientContext.Provider>;
}

export function useAuthClient() {
  const authClient = useContext(AuthClientContext);
  if (!authClient) {
    throw new Error("AuthClientProvider is required");
  }

  return authClient;
}
