import { useAuth } from "@clerk/clerk-react";

export function useAuthStatus() {
  const { isLoaded, isSignedIn } = useAuth();

  return {
    isLoaded,
    isSignedIn: Boolean(isSignedIn),
  };
}
