import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enCommon from "@/i18n/locales/en/common.json";
import esCommon from "@/i18n/locales/es/common.json";

void i18n.use(initReactI18next).init({
  resources: {
    es: { translation: esCommon },
    en: { translation: enCommon },
  },
  lng: "es",
  fallbackLng: "es",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
