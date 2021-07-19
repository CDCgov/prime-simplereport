import { LanguageConfig } from "./en";

const YES = "";
const NO = "";
const OTHER = "";
const REFUSED = "";
const UNKNOWN = "";

export const es: LanguageConfig = {
  translation: {
    header: "Portal de pruebas COVID-19",
    constants: {
      testResults: {
        POSITIVE: "",
        NEGATIVE: "",
        UNDETERMINED: "",
        UNKNOWN: UNKNOWN,
      },
      role: {
        STAFF: "",
        RESIDENT: "",
        STUDENT: "",
        VISITOR: "",
      },
      race: {
        native: "",
        asian: "",
        black: "",
        pacific: "",
        white: "",
        other: OTHER,
        refused: REFUSED,
      },
      gender: {
        female: "",
        male: "",
        other: OTHER,
        refused: REFUSED,
      },
      ethnicity: {
        hispanic: YES,
        not_hispanic: NO,
        refused: REFUSED,
      },
      phoneType: {
        MOBILE: "",
        LANDLINE: "",
      },
      yesNoUnk: {
        YES,
        NO,
        UNKNOWN,
      },
    },
    common: {
      required: "",
      defaultDropdownOption: "",
      button: {
        submit: "",
      },
      pageNotFound: {
        heading: "",
        text: "",
        errorCode: "",
      },
    },
    address: {
      heading: "",
      select: "",
      useAddress: "",
      getSuggested: "",
      noSuggestedFound: "",
      goBack: "",
      goBack_plural: "",
      save: "",
      errors: {
        incomplete: "",
        unverified: "",
        unverified_plural: "",
      },
    },
    facility: {
      form: {
        heading: "",
        allFacilities: "",
      },
    },
    patient: {
      form: {
        general: {
          heading: "",
          helpText: "",
          firstName: "",
          middleName: "",
          lastName: "",
          role: "",
          studentId: "",
          preferredLanguage: "",
          dob: "",
        },
        contact: {
          heading: "",
          primaryPhoneNumber: "",
          additionalPhoneNumber: "",
          phoneType: "",
          addNumber: "",
          email: "",
          street1: "",
          street2: "",
          county: "",
          city: "",
          state: "",
          zip: "",
        },
        demographics: {
          heading: "",
          helpText: "",
          race: "",
          tribalAffiliation: "",
          ethnicity: "",
          gender: "",
        },
        other: {
          heading: "",
          congregateLiving: {
            heading: "",
            helpText: "",
          },
          healthcareWorker: "",
        },
        errors: {
          unsaved: "",
          validationMsg: "",
          firstName: "",
          middleName: "",
          lastName: "",
          lookupId: "",
          role: "",
          facilityId: "",
          birthDate: "",
          telephone: "",
          phoneNumbers: "",
          email: "",
          street: "",
          streetTwo: "",
          zipCode: "",
          state: "",
          city: "",
          county: "",
          race: "",
          tribalAffiliation: "",
          ethnicity: "",
          gender: "",
          residentCongregateSetting: "",
          employedInHealthcare: "",
          preferredLanguage: "",
        },
      },
    },
    selfRegistration: {
      form: {
        complete: "",
        inProgress: "",
        error: {
          heading: "",
          text: "",
        },
      },
      confirmation: {
        registered: "",
        checkIn: "",
      },
    },
    testResult: {
      result: "",
      patient: "",
      testResult: "",
      testDate: "",
      positive: "",
      negative: "",
      undetermined: "",
      unknown: "",
      testDevice: "",
      meaning: "",
      information: "",
      notes: {
        positive: {
          p1: "",
          guidelines: {
            li0: "",
            li1: "",
            li2: "",
            li3: "",
            li4: "",
            li5: "",
          },
          p2: "",
          p3: "",
          emergency: {
            li0: "",
            li1: "",
            li2: "",
            li3: "",
            li4: "",
          },
          difficultNewsLink: "",
        },
        negative: {
          p0: "",
          symptoms: {
            li0: "",
            li1: "",
            li2: "",
            li3: "",
            li4: "",
            li5: "",
            li6: "",
            li7: "",
            li8: "",
            li9: "",
            li10: "",
          },
        },
        inconclusive: {
          p0: "",
          p1: "",
        },
      },
      tos: {
        header: "",
        introText: "",
        consent: "",
        submit: "",
        document: {
          intro: {
            p0: "",
          },
          scope: {
            heading: "",
            p0: "",
          },
          dataRights: {
            heading: "",
            subheading: "",
            l0: "",
            p0: "",
            l1: "",
            p1: "",
          },
          privacy: {
            heading: "",
            p0: "",
            p1: "",
          },
          useOfData: {
            heading: "",
            p0: "",
          },
          sharingOfData: {
            heading: "",
            p0: "",
          },
          otherResponsibilities: {
            heading: "",
            ul: {
              li0: "",
              li1: "",
              li2: "",
              li3: "",
              li4: "",
              li5: "",
              li6: "",
              li7: "",
              li8: "",
            },
          },
          serviceManagement: {
            heading: "",
            subheading: "",
            p0: "",
          },
          serviceTermination: {
            heading: "",
            p0: "",
            p1: "",
          },
          intellectualProperty: {
            heading: "",
            p0: "",
          },
          disclaimerOfWarranties: {
            heading: "",
            p0: "",
          },
          limitationOfLiability: {
            heading: "",
            p0: "",
            p1: "",
          },
          disputes: {
            heading: "",
            p0: "",
          },
          indemnification: {
            heading: "",
            p0: "",
          },
          noWaiverOfRights: {
            heading: "",
            p0: "",
          },
          dataAnalytics: {
            heading: "",
            p0: "",
          },
        },
      },
      dob: {
        dateOfBirth: "",
        enterDOB: "",
        enterDOB2: "",
        error: "",
        validating: "",
        linkExpired: "",
        submit: "",
      },
    },
  },
};
