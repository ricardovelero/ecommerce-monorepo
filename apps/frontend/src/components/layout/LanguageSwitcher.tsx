import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const currentLang = params.lang === "en" ? "en" : "es";

  function switchTo(nextLang: "es" | "en") {
    const pathWithoutLang = location.pathname.replace(/^\/(es|en)/, "") || "/";
    void i18n.changeLanguage(nextLang);
    navigate(`/${nextLang}${pathWithoutLang}${location.search}`);
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">{t("language")}</span>
      <Button size="sm" variant={currentLang === "es" ? "default" : "outline"} onClick={() => switchTo("es")}>
        ES
      </Button>
      <Button size="sm" variant={currentLang === "en" ? "default" : "outline"} onClick={() => switchTo("en")}>
        EN
      </Button>
    </div>
  );
}
