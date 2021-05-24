import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { en } from "./lang/en";
import { es } from "./lang/es";

// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them via a UI: https://react.i18next.com/guides/multiple-translation-files#manage-your-translations-with-a-management-gui)
export const resources = { en, es };

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: localStorage.getItem("language") || "en",
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
