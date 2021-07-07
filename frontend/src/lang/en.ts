const YES = "Yes";
const NO = "No";
const OTHER = "Other";
const PREFER_NOT_TO_ANSWER = "Prefer not to answer";
const UNKNOWN = "Unknown";

export const en = {
  translation: {
    header: "COVID-19 Testing Portal",
    common: {
      required: "Required fields are marked with an asterisk",
      button: {
        submit: "Submit"
      },
      pageNotFound: {
        heading: "Page not found",
        text: "We're sorry, we can't find the page you're looking for. It might have been removed, had its name changed, or is otherwise unavailable.",
        errorCode: "Error code: 404"
      }
    },
    address: {
      errors: {
        incomplete: "Please choose an address or go back to edit",
        unverified: "The address${ multipleAddresses you entered could not be verified`"
      }
    },
    facility: {
      form: {
        heading: "Facility",
        allFacilities: "All facilities",
      }
    },
    patient: {
      form: {
        general: {
          heading: "General information",
          helpText: "Required fields are marked with an asterisk",
          firstName: "First name",
          middleName: "Middle name",
          lastName: "Last name",
          role: {
            heading: "Role",
            options: [
              "- Select -",
              "Staff",
              "Resident",
              "Student",
              "Visitor",
            ]
          },
          studentId: "Student ID",
          preferredLanguage: "Preferred Language",
          dob: "Date of birth",
        },
        contact: {
          heading: "Contact information",
          primaryPhoneNumber: "Primary phone number",
          additionalPhoneNumber: "Additional phone number",
          phoneType: {
            heading: "Phone type",
            mobile: "Mobile",
            landline: "Landline",
          },
          addNumber: "Add another number",
          email: "Email address",
          street1: "Street address 1",
          street2: "Street address 2",
          county: "County",
          city: "City",
          state: "State",
          zip: "Zip code"
        },
        demographics: {
          heading: "Demographics",
          helpText: "This information is collected as part of public health efforts to recognize and address inequality in health outcomes.",
          race: {
            heading: "Race",
            options: [
              "American Indian/Alaskan Native",
              "Asian",
              "Black/African American",
              "Native Hawaiian/other Pacific Islander",
              "White",
              "Other",
              "Prefer not to answer",
            ]
          },
          tribalAffiliation: {
            heading: "Tribal affiliation",
            options: [YES, NO, PREFER_NOT_TO_ANSWER]
          },
          ethnicity: {
            heading: "Are you Hispanic or Latino?",
            options: [YES, NO, PREFER_NOT_TO_ANSWER]
          },
          gender: {
            heading: "Biological sex",
            options: ["Female", "Male", OTHER, PREFER_NOT_TO_ANSWER]
          },
        },
        other: {
          heading: "Other",
          congregateLiving: {
            heading: "Are you a resident in a congregate living setting?",
            helpText: "For example: nursing home, group home, prison, jail, or military",
            options: [YES, NO, UNKNOWN]
          },
          healthcareWorker: {
            heading: "Are you a health care worker?",
            options: [YES, NO, UNKNOWN]
          }
        },
        errors: {
          unsaved: "\nYour changes are not yet saved!\n\nClick OK discard changes, Cancel to continue editing.",
          validationMsg: "Please correct before submitting",
        }
      },
    },
    selfRegistration: {
      form: {
        complete: "Registration complete",
        inProgress: "Register for your test",
        error: {
          heading: "Registration error",
          text: "There was a registration error",
        }
      },
      confirmation: {
        registered: "<span className=\"text-bold\"><2>{{personName}}</2></span>, you\'re registered for a COVID-19 test at <4>{{entityName}}</4>.",
        checkIn: "When you arrive for your test, check in by providing your first and last name."
      }
    }
  }
};

export type LanguageConfig = typeof en;
