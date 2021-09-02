import Button from "../app/commonComponents/Button/Button";
import i18n from "../i18n";

export default function LanguageToggler() {
  return (
    <Button
      icon={"globe"}
      className="usa-button--unstyled"
      onClick={() => {
        const displayLanguage = i18n.language === "en" ? "es" : "en";
        i18n.changeLanguage(displayLanguage);
      }}
    >
      {i18n.language === "en" ? "Español" : "English"}
    </Button>
  );
}
