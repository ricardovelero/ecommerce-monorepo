import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { languageStorageKey } from "@/i18n";

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const currentLang = params.lang === "en" ? "en" : "es";

  function switchTo(nextLang: "es" | "en") {
    const pathWithoutLang = location.pathname.replace(/^\/(es|en)/, "") || "/";
    window.localStorage.setItem(languageStorageKey, nextLang);
    void i18n.changeLanguage(nextLang);
    navigate(`/${nextLang}${pathWithoutLang}${location.search}`);
  }

  return (
    <div className="flex items-center gap-2" aria-label={t("language.switcher")}>
      <span className="text-xs text-muted-foreground">{t("language.label")}</span>
      <Button
        size="sm"
        variant={currentLang === "es" ? "default" : "outline"}
        onClick={() => switchTo("es")}
        aria-label={t("language.spanish")}
      >
        ES
      </Button>
      <Button
        size="sm"
        variant={currentLang === "en" ? "default" : "outline"}
        onClick={() => switchTo("en")}
        aria-label={t("language.english")}
      >
        EN
      </Button>
    </div>
  );
}
