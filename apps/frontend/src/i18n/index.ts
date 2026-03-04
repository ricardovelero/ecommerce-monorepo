import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enCommon from "@/i18n/locales/en/common.json";
import esCommon from "@/i18n/locales/es/common.json";

const storageKey = "ecommerce-lang";
const storedLanguage = typeof window !== "undefined" ? window.localStorage.getItem(storageKey) : null;
const initialLanguage = storedLanguage === "en" ? "en" : "es";

void i18n.use(initReactI18next).init({
  resources: {
    es: { translation: esCommon },
    en: { translation: enCommon },
  },
  lng: initialLanguage,
  fallbackLng: "es",
  interpolation: {
    escapeValue: false,
  },
});

export { storageKey as languageStorageKey };
export default i18n;
