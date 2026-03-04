import { useQuery } from "@tanstack/react-query";

import { useAuthClient } from "@/features/auth/hooks/useAuthClient";

export function useUserRole() {
  const authClient = useAuthClient();

  return useQuery({
    queryKey: ["auth", "role"],
    queryFn: () => authClient.getUserRole(),
    enabled: authClient.isAuthenticated(),
  });
}
