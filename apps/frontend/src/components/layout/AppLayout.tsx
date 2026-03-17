import type { ReactNode } from "react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { AppHeader } from "@/components/layout/AppHeader";
import { languageStorageKey } from "@/i18n";

export function AppLayout({ children }: { children: ReactNode }) {
  const { lang } = useParams();
  const { i18n } = useTranslation();

  useEffect(() => {
    const target = lang === "en" ? "en" : "es";
    if (i18n.language !== target) {
      void i18n.changeLanguage(target);
    }
    window.localStorage.setItem(languageStorageKey, target);
    document.documentElement.lang = target;
  }, [lang]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/50">
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
