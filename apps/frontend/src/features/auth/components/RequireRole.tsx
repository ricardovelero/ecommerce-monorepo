import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";

import type { UserRole } from "@/features/auth/domain/AuthClient";
import { useAuthClient } from "@/features/auth/hooks/useAuthClient";

export function RequireRole({
  role,
  children,
}: {
  role: UserRole;
  children: React.ReactNode;
}) {
  const authClient = useAuthClient();
  const { lang } = useParams();
  const [status, setStatus] = useState<"loading" | "allowed" | "forbidden" | "signin">("loading");

  useEffect(() => {
    if (!authClient.isAuthenticated()) {
      setStatus("signin");
      void authClient.signIn();
      return;
    }

    let active = true;

    authClient
      .getUserRole()
      .then((resolvedRole) => {
        if (!active) {
          return;
        }

        setStatus(resolvedRole === role ? "allowed" : "forbidden");
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setStatus("signin");
        void authClient.signIn();
      });

    return () => {
      active = false;
    };
  }, [authClient, role]);

  if (status === "loading" || status === "signin") {
    return null;
  }

  if (status === "forbidden") {
    return <Navigate to={`/${lang ?? "es"}`} replace />;
  }

  return <>{children}</>;
}
