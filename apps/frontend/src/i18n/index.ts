import i18n, { createInstance } from "i18next";
import { initReactI18next } from "react-i18next";

import enCommon from "@/i18n/locales/en/common.json";
import esCommon from "@/i18n/locales/es/common.json";

export const languageStorageKey = "ecommerce-lang";
export type AppLanguage = "es" | "en";

const resources = {
  es: { translation: esCommon },
  en: { translation: enCommon },
} as const;

export function resolveLanguage(value: string | null | undefined): AppLanguage {
  return value === "en" ? "en" : "es";
}

function getInitialLanguage(): AppLanguage {
  if (typeof window === "undefined") {
    return "es";
  }

  return resolveLanguage(window.localStorage.getItem(languageStorageKey));
}

export function createAppI18n(initialLanguage: AppLanguage) {
  const instance = createInstance();
  void instance.use(initReactI18next).init({
    resources,
    lng: initialLanguage,
    fallbackLng: "es",
    initImmediate: false,
    interpolation: {
      escapeValue: false,
    },
  });

  return instance;
}

const appI18n = createAppI18n(getInitialLanguage());

export default appI18n;
