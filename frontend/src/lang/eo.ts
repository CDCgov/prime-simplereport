import { en, LanguageConfig } from "./en";

const YES = "Jes";
const NO = "Ne";
const OTHER = "Alia";
const REFUSED = "Mi preferas ne respondi";
const UNKNOWN = "Nekonata";
const NOT_SURE = "Mi ne certas";
const POSITIVE = "Pozitiva";
const NEGATIVE = "Negativa";
const UNDETERMINED = "Nedifinita";

export const eo: LanguageConfig = {
  translation: {
    // This is not correct, but since this is still a draft,
    // it will be left like this so the TypeScript compiler doesn't complain.
    ...en.translation,
    header: "COVID-19 Testa Portalo",
    banner: {
      dotGov: ".gov fino signifas, ke la retejo estas oficiala.",
      dotGovHelper:
        "Federaciaj registaraj retejoj ofte finiĝas per .gov aŭ .mil. Antaŭ ol dividi sentemajn informojn, certigu, ke vi estas en federacia registarretejo.",
      secure: "La retejo estas sekura.",
      secureHelper:
        "La <0>https://</0> certigas, ke vi konektas al la oficiala retejo kaj ke ajna informo, kiun vi provizas, estas ĉifrita kaj sekure transdonita.",
      officialWebsite:
        "Oficiala retejo de la Usona Registaro",
      howYouKnow: "Jen kiel vi scias",
    },
    constants: {
      testResults: {
        POSITIVE,
        NEGATIVE,
        UNDETERMINED,
        UNKNOWN,
      },
      testResultsSymbols: {
        POSITIVE: "(+)",
        NEGATIVE: "(-)",
      },
      disease: {
        COVID19: "COVID-19",
        FLUA: "Gripo A",
        FLUB: "Gripo B",
        FLUAB: "Gripo A kaj B",
        RSV: "RSV",
        HIV: "HIV",
        SYPHILIS: "Sifiliso",
        HEPATITIS_C: "Hepatito C",
        GONORRHEA: "Gonoreo",
        CHLAMYDIA: "Klamidio",
      },
      diseaseResultTitle: {
        COVID19: "COVID-19 rezulto",
        FLUA: "Gripo A rezulto",
        FLUB: "Gripo B rezulto",
        FLUAB: "Gripo A kaj B rezulto",
        RSV: "RSV rezulto",
        HIV: "HIV testa rezulto",
        SYPHILIS: "Sifiliso rezulto",
        HEPATITIS_C: "Hepatito C rezulto",
        GONORRHEA: "Gonoreo rezulto",
        CHLAMYDIA: "Klamidio rezulto",
      },
      role: {
        STAFF: "Personaro",
        RESIDENT: "Loĝanto",
        STUDENT: "Studento",
        VISITOR: "Vizitanto",
      },
      race: {
        native: "Indiĝena/Alaska Nativo",
        asian: "Azia",
        black: "Nigra/Afroamerikano",
        pacific: "Havaja Nativo/Aliaj Pacifikaj Insuloj",
        white: "Blanka",
        other: OTHER,
        refused: REFUSED,
      },
      gender: {
        female: "Ina",
        male: "Vira",
      },
      ethnicity: {
        hispanic: YES,
        not_hispanic: NO,
        refused: REFUSED,
      },
      phoneType: {
        MOBILE: "Poŝtelefono",
        LANDLINE: "Fikstelefono",
      },
      yesNoUnk: {
        YES,
        NO,
        UNKNOWN,
      },
      yesNoNotSure: {
        YES,
        NO,
        NOT_SURE,
      },
      date: {
        month: "Monato",
        day: "Tago",
        year: "Jaro",
      },
    },
    languages: {
      English: "Angla",
      Spanish: "Hispana",
      Esperanto: "Esperanto"
    },
    // Draft will continue here
  },
};
