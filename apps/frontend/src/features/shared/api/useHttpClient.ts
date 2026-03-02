import { useMemo } from "react";

import { useAuthClient } from "@/features/auth/hooks/useAuthClient";
import { HttpClient } from "@/features/shared/api/http";

export function useHttpClient() {
  const authClient = useAuthClient();
  return useMemo(() => new HttpClient(authClient), [authClient]);
}
