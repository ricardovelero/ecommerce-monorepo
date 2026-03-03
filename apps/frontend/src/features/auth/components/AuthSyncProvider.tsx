import { useAuth, useUser } from "@clerk/clerk-react";
import { useEffect } from "react";

import type { MeResponse } from "@/features/auth/domain/AuthClient";
import { useHttpClient } from "@/features/shared/api/useHttpClient";

const syncedExternalIds = new Set<string>();
const syncingExternalIds = new Set<string>();

function normalizeEmail(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  return normalized || null;
}

export function AuthSyncProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const http = useHttpClient();

  useEffect(() => {
    const externalId = user?.id;
    if (!isSignedIn || !externalId) {
      return;
    }

    if (syncedExternalIds.has(externalId) || syncingExternalIds.has(externalId)) {
      return;
    }

    syncingExternalIds.add(externalId);

    void (async () => {
      try {
        const me = await http.get<MeResponse>("/api/me");
        const clerkEmail = normalizeEmail(user.emailAddresses[0]?.emailAddress);
        const backendEmail = normalizeEmail(me.email);

        if (!clerkEmail) {
          syncedExternalIds.add(externalId);
          return;
        }

        if (backendEmail !== clerkEmail) {
          await http.patch<MeResponse>("/api/me/email", { email: clerkEmail });
        }

        syncedExternalIds.add(externalId);
      } catch (error) {
        console.warn("Auth email sync skipped", error);
        syncedExternalIds.add(externalId);
      } finally {
        syncingExternalIds.delete(externalId);
      }
    })();
  }, [http, isSignedIn, user]);

  return <>{children}</>;
}
