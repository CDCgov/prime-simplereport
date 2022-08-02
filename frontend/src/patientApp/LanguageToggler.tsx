import Button from "../app/commonComponents/Button/Button";
import i18n from "../i18n";
import { setDocumentLanguage } from "../app/utils/languages";

export default function LanguageToggler() {
  return (
    <div lang={i18n.language === "en" ? "es" : "en"}>
      <Button
        icon={"globe"}
        className="usa-button--unstyled"
        onClick={() => {
          const displayLanguage = i18n.language === "en" ? "es" : "en";
          i18n.changeLanguage(displayLanguage);
          setDocumentLanguage(displayLanguage);
        }}
      >
        {i18n.language === "en" ? "Español" : "English"}
      </Button>
    </div>
  );
}
