import Button from "../app/commonComponents/Button/Button";
import i18n from "../i18n";
import { setLanguage } from "../app/utils/languages";

export default function LanguageToggler() {
  return (
    <div lang={i18n.language === "en" ? "es" : "en"}>
      <Button
        icon={"globe"}
        className="usa-button--unstyled"
        onClick={() => {
          const displayLanguage = i18n.language === "en" ? "es" : "en";
          setLanguage(displayLanguage);
        }}
      >
        {i18n.language === "en" ? "Español" : "English"}
      </Button>
    </div>
  );
}
