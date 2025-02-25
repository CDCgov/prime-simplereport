import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { en } from "./lang/en";
import { es } from "./lang/es";
import { eo } from "./lang/eo";

export const resources = { en, es, eo };

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem("language") || "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
