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
          p0: "",
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
          p4: "",
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
