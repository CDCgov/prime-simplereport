import { LanguageConfig } from "./en";

export const es: LanguageConfig = {
  translation: {
    header: "Portal de pruebas COVID-19",
    common: {
      required: "",
      button: {
        submit: ""
      },
      pageNotFound: {
        heading: "",
        text: "",
        errorCode: ""
      }
    },
    address: {
      errors: {
        incomplete: "",
        unverified: ""
      }
    },
    facility: {
      form: {
        heading: "",
        allFacilities: "",
      }
    },
    patient: {
      form: {
        general: {
          heading: "",
          helpText: "",
          firstName: "",
          middleName: "",
          lastName: "",
          role: {
            heading: "",
            options: [
              "",
              "",
              "",
              "",
              "",
            ]
          },
          studentId: "",
          preferredLanguage: "",
          dob: "",
        },
        contact: {
          heading: "",
          primaryPhoneNumber: "",
          additionalPhoneNumber: "",
          phoneType: {
            heading: "",
            mobile: "",
            landline: "",
          },
          addNumber: "",
          email: "",
          street1: "",
          street2: "",
          county: "",
          city: "",
          state: "",
          zip: ""
        },
        demographics: {
          heading: "",
          helpText: "",
          race: {
            heading: "",
            options: [
              "",
              "",
              "",
              "",
              "",
              "",
              "",
            ]
          },
          tribalAffiliation: {
            heading: "",
            options: []
          },
          ethnicity: {
            heading: "",
            options: []
          },
          gender: {
            heading: "",
            options: []
          },
        },
        other: {
          heading: "",
          congregateLiving: {
            heading: "",
            helpText: "",
            options: []
          },
          healthcareWorker: {
            heading: "",
            options: []
          }
        },
        errors: {
          unsaved: "",
          validationMsg: "",
        }
      }
    },
    selfRegistration: {
      form: {
        complete: "",
        inProgress: "",
        error: {
          heading: "",
          text: "",
        }
      },
      confirmation: {
        registered: "",
        checkIn: ""
      }
    }
  }
};