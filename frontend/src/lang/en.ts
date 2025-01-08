import { GenderIdentityDisplay, UNKNOWN } from "../app/utils/gender";

const YES = "Yes";
const NO = "No";
const OTHER = "Other";
const REFUSED = "Prefer not to answer";
const NOT_SURE = "Not sure";

const FEMALE = GenderIdentityDisplay.female;
const MALE = GenderIdentityDisplay.male;
export const en = {
  translation: {
    header: "SimpleReport test result portal",
    banner: {
      dotGov: "The .gov means it’s official.",
      dotGovHelper:
        "Federal government websites often end in .gov or .mil. Before sharing sensitive information, make sure you’re on a federal government site.",
      secure: "The site is secure.",
      secureHelper:
        "The <0>https://</0> ensures that you are connecting to the official website and that any information you provide is encrypted and transmitted securely.",
      officialWebsite: "An official website of the United States government",
      howYouKnow: "Here’s how you know",
    },
    constants: {
      testResults: {
        POSITIVE: "Positive",
        NEGATIVE: "Negative",
        UNDETERMINED: "Inconclusive",
        UNKNOWN: UNKNOWN,
      },
      testResultsSymbols: {
        POSITIVE: "(+)",
        NEGATIVE: "(-)",
      },
      disease: {
        COVID19: "COVID-19",
        FLUA: "Flu A",
        FLUB: "Flu B",
        FLUAB: "Flu A and B",
        RSV: "RSV",
        HIV: "HIV",
        SYPHILIS: "Syphilis",
        HEPATITIS_C: "Hepatitis C",
        GONORRHEA: "Gonorrhea",
        CHLAMYDIA: "Chlamydia",
      },
      diseaseResultTitle: {
        COVID19: "COVID-19 result",
        FLUA: "Flu A result",
        FLUB: "Flu B result",
        FLUAB: "Flu A and B result",
        RSV: "RSV result",
        HIV: "HIV result",
        SYPHILIS: "Syphilis result",
        HEPATITIS_C: "Hepatitis C result",
        GONORRHEA: "Gonorrhea result",
        CHLAMYDIA: "Chlamydia result",
      },
      role: {
        STAFF: "Staff",
        RESIDENT: "Resident",
        STUDENT: "Student",
        VISITOR: "Visitor",
      },
      race: {
        native: "American Indian/Alaskan Native",
        asian: "Asian",
        black: "Black/African American",
        pacific: "Native Hawaiian/other Pacific Islander",
        white: "White",
        other: OTHER,
        refused: REFUSED,
      },
      genderIdentity: {
        female: FEMALE,
        male: MALE,
        transwoman: GenderIdentityDisplay.transwoman,
        transman: GenderIdentityDisplay.transman,
        nonbinary: GenderIdentityDisplay.nonbinary,
        other: "Gender identity not listed here",
        refused: REFUSED,
      },
      gender: {
        female: FEMALE,
        male: MALE,
        other: OTHER,
        refused: REFUSED,
      },
      ethnicity: {
        hispanic: YES,
        not_hispanic: NO,
        refused: REFUSED,
      },
      phoneType: {
        MOBILE: "Mobile",
        LANDLINE: "Landline",
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
        month: "Month",
        day: "Day",
        year: "Year",
      },
    },
    languages: {
      English: "English",
      Spanish: "Spanish",
    },
    common: {
      required: "Required fields are marked with an asterisk",
      defaultDropdownOption: "- Select -",
      button: {
        submit: "Submit",
        save: "Save changes",
        saving: "Saving",
      },
      pageNotFound: {
        heading: "Page not found",
        text: "We're sorry, we can't find the page you're looking for. It might have been removed, had its name changed, or is otherwise unavailable.",
        errorCode: "Error code: 404",
      },
    },
    address: {
      heading: "Address validation",
      select: "Please select an option to continue:",
      useAddress: "Use address as entered",
      getSuggested: "Use suggested address",
      noSuggestedFound: "No suggested address found",
      goBack: "Go back to edit address",
      goBack_plural: "Go back to edit addresses",
      save: "Save changes",
      errors: {
        incomplete: "Please choose an address or go back to edit",
        unverified: "The address you entered could not be verified",
        unverified_plural: "The addresses you entered could not be verified",
      },
    },
    facility: {
      form: {
        heading: "Testing facility",
        allFacilities: "All testing facilities",
      },
    },
    patient: {
      form: {
        general: {
          heading: "General information",
          helpText: "Required fields are marked with an asterisk",
          firstName: "First name",
          middleName: "Middle name",
          lastName: "Last name",
          role: "Role",
          studentId: "Student ID",
          preferredLanguage: "Preferred language",
          dob: "Date of birth",
          dobFormat: "mm/dd/yyyy",
        },
        contact: {
          heading: "Contact information",
          phoneHeading: "Phone",
          unknownPhoneNumber: "Phone number unknown",
          emailHeading: "Email",
          addressHeading: "Address",
          unknownAddress: "Address unknown or patient unhoused",
          helpText:
            "You're responsible for entering correct contact information, following applicable federal and state laws.",
          primaryPhoneNumber: "Primary phone number",
          additionalPhoneNumber: "Additional phone number",
          phoneType: "Phone type",
          addNumber: "Add another number",
          email: "Email address",
          additionalEmail: "Additional email address",
          addEmail: "Add another email address",
          country: "Country",
          street1: "Street address 1",
          street2: "Street address 2",
          county: "County",
          city: "City",
          state: "State",
          zip: "ZIP code",
        },
        testResultDelivery: {
          text: "Would you like to receive your results via text message?",
          receiveTextMessageResults: "Yes, text all mobile numbers on file.",
          email: "Would you like your test result sent to this email?",
          email_plural: "Would you like your test result sent to these emails?",
          receiveEmailResults: YES,
        },
        demographics: {
          heading: "Demographics",
          helpText:
            "This information is collected as part of public health efforts to recognize and address inequality in health outcomes.",
          race: "Race",
          tribalAffiliation: "Tribal affiliation",
          ethnicity: "Are you Hispanic or Latino?",
          gender: "Sex assigned at birth",
          genderIdentity: "What's your gender identity?",
          genderHelpText:
            "This is usually the gender that is written on your original birth certificate.",
        },
        housingAndWork: {
          heading: "Housing and work",
          congregateLiving: {
            heading:
              "Are you a resident in a group or shared housing facility?",
            helpText:
              "For example: nursing home, group home, prison, jail, or military",
          },
          healthcareWorker: "Are you a health care worker?",
        },
        notes: {
          heading: "Notes",
          helpText:
            "Add details about the patient's location or alternative contact information.",
        },
        errors: {
          unsaved:
            "\nYour changes are not yet saved!\n\nClick OK discard changes, Cancel to continue editing.",
          validationMsg: "Please correct before submitting",
          firstName: "First name is missing",
          fieldLength: "This answer is too long",
          middleName: "Middle name is incorrectly formatted",
          lastName: "Last name is missing",
          lookupId: "Student ID is incorrectly formatted",
          role: "Role is incorrectly formatted",
          facilityId: "Testing facility is missing",
          birthDate: {
            base: "Date of birth is missing or in the wrong format",
            past: "Date of birth is too far in the past",
            future: "Date of birth can’t be in the future",
          },
          telephone: "Phone number is missing or invalid",
          phoneNumbers: "Phone numbers are missing or invalid",
          phoneNumbersType: "Phone type is required",
          phoneNumbersDuplicate: "Duplicate phone number entered",
          email: "Email is incorrectly formatted",
          street: "Street address is missing",
          streetTwo: "Street 2 is incorrectly formatted",
          zipCode: "ZIP code is missing",
          zipForState: "Invalid ZIP code for this state",
          state: "State is missing",
          city: "City is missing",
          county: "County is incorrectly formatted",
          country: "Country is incorrectly formatted",
          race: "Race is missing",
          tribalAffiliation: "Tribal affiliation is incorrectly formatted",
          ethnicity: "Ethnicity is missing",
          gender: "Sex assigned at birth is missing",
          residentCongregateSetting:
            "Are you a resident in a congregate living setting? is required",
          employedInHealthcare: "Are you a health care worker? is required",
          preferredLanguage: "Preferred language is incorrectly formatted",
          testResultDelivery:
            "Test result delivery preference is incorrectly formatted",
        },
      },
    },
    selfRegistration: {
      title: "Test registration form",
      form: {
        complete: "Registration complete",
        inProgress: "Register for your test",
        error: {
          heading: "Registration error",
          text: "There was a registration error",
        },
      },
      confirmation: {
        title: "Test registration complete",
        registered:
          "<0>{{personName}}</0>, thanks for completing your patient profile at {{entityName}}.",
        checkIn:
          "When you arrive for your test, check in by giving your first and last name.",
      },
      duplicate: {
        heading: "You're already registered at",
        message:
          "Our records show someone has registered with the same name, date of birth, and ZIP code. Please check in with " +
          "your testing facility staff. You don't need to register again.",
        exit: "Exit sign up",
      },
    },
    testResult: {
      title: "Test result",
      singleResultHeader: "Test result",
      multipleResultHeader: "Test results",
      downloadResult: "Download result",
      patient: "Patient",
      patientDetails: "Patient details",
      name: "Name",
      testDetails: "Test details",
      testName: "Test name",
      testResult: "Test result",
      testDate: "Test date",
      positive: "Positive",
      negative: "Negative",
      undetermined: "Inconclusive",
      unknown: "Unknown",
      testDevice: "Test device",
      id: "Test ID",
      information:
        "For more information go to <0>CDC.gov</0> or call 1-800-CDC-INFO (1-800-232-4636). Use the <1>County Check Tool</1> (cdc.gov/coronavirus/2019-ncov/your-health/covid-by-county.html) to understand your Community Level (COVID-19 risk and hospital capacity in your area), tips for prevention, and how to find vaccine, testing, and treatment resources.",
      cdcLink: "https://www.cdc.gov/",
      countyCheckToolLink:
        "https://www.cdc.gov/coronavirus/2019-ncov/your-health/covid-by-county.html",
      moreInformation: "More information",
      printed: "Test result printed",
      print: "Print",
      close: "Close",
      testingFacility: {
        details: "Testing facility details",
        name: "Facility name",
        phone: "Facility phone",
        address: "Facility address",
        clia: "CLIA number",
        orderingProvider: "Ordering provider",
        npi: "NPI",
      },
      notes: {
        h1: "For COVID-19:",
        meaning:
          "COVID-19 antigen tests can sometimes provide inaccurate or false results and follow up testing may be needed. Continue " +
          "social distancing and wearing a mask. Contact your health care provider to determine if additional " +
          "testing is needed especially if you experience any of these  symptoms.",
        positive: {
          p1: "Most people who get COVID-19 are able to recover at home. Make sure to follow CDC guidelines and local laws for people who are recovering at home and their caregivers, including:",
          guidelines: {
            li0: "Stay home when you are sick, except to get medical care.",
            li1:
              "Stay home for 5 days. " +
              "If you have no symptoms or your symptoms are resolving after 5 days, you can leave your house. " +
              "Continue to wear a mask around others for 5 additional days.",
            li2:
              "If you are self isolating at home where others live, use a separate room and bathroom for sick household members (if possible). " +
              "Clean any shared rooms as needed, to avoid transmitting the virus.",
            li3:
              "Wash your hands often with soap and water for at least 20 seconds, especially after blowing your nose, coughing, or sneezing; " +
              "going to the bathroom; and before eating or preparing food.",
            li4: "If soap and water are not available, use an alcohol-based hand sanitizer with at least 60% alcohol.",
            li5: "Have a supply of clean, disposable face masks. Everyone, no matter their COVID-19 diagnosis, should wear face masks while in the home.",
          },
          p2: "Watch for symptoms and learn when to seek emergency medical attention: <0>Symptoms of COVID-19</0> (cdc.gov/coronavirus/2019-ncov/symptoms-testing/symptoms.html). If someone is showing any of these signs, seek emergency medical care immediately:",
          symptomsLink:
            "https://www.cdc.gov/coronavirus/2019-ncov/symptoms-testing/symptoms.html",
          emergency: {
            li0: "Trouble breathing",
            li1: "Persistent chest pain/pressure",
            li2: "Confusion",
            li3: "Inability to wake or stay awake",
            li4: "Bluish lips or face",
          },
          p3: "Call 911 or call ahead to your local emergency room: Notify the operator that you are seeking care for someone who has or may have COVID-19.",
        },
        negative: {
          p0: "Contact your health care provider to decide if additional testing is needed, especially if you experience any of these symptoms:",
          symptoms: {
            li0: "Fever or chills",
            li1: "Cough",
            li2: "Shortness of breath or difficulty breathing",
            li3: "Fatigue",
            li4: "Muscle or body aches",
            li5: "Headache",
            li6: "Loss of taste or smell",
            li7: "Sore throat",
            li8: "Congestion or runny nose",
            li9: "Nausea or vomiting",
            li10: "Diarrhea",
          },
          moreInformation:
            "For more information, please visit the <0>Centers for Disease Control and Prevention (CDC)</0> website or contact\n" +
            "your local health department.",
        },
        inconclusive: {
          p0:
            "An inconclusive result is neither positive nor negative. This can happen because of problems with the sample collection, a very " +
            "early-stage COVID-19 infection, or for patients with COVID-19 that are close to recovery. With an inconclusive result, collecting " +
            "and testing another sample is recommended.",
          p1:
            "Please make an appointment for another test as soon as possible. If you’ve gotten tested due to COVID-19 symptoms, it is " +
            "recommended that you self-isolate until you get your new test results.",
        },
      },
      fluNotes: {
        h1: "For flu A and B:",
        positive: {
          p0: "Most people with flu have mild illness and can recover at home. Stay at home and avoid contact with others until at least 24 hours after your fever is gone, except to get medical care or other necessities. Wear a face mask if you leave home, or cover coughs and sneezes with a tissue. Wash your hands often.",
          p1: "<0>People at Higher Risk of Developing Flu–Related Complications</0> (cdc.gov/flu/highrisk) should contact a doctor as soon as possible to see if antiviral treatment is recommended.",
          p2: "For more information, visit <0> Flu: What To Do If You Get Sick</0> (cdc.gov/flu/treatment/takingcare.htm).",
          highRiskLink: "https://www.cdc.gov/flu/highrisk",
          treatmentLink: "https://www.cdc.gov/flu/treatment/takingcare.htm",
        },
      },
      rsvNotes: {
        h1: "For RSV:",
        positive: {
          p0: "RSV usually causes mild, cold-like symptoms. Most people can recover at home, but RSV can cause serious illness and hospitalization for infants and older adults. You can help prevent the spread of RSV by staying at home when sick, avoiding close contact with others, and washing your hands frequently.",
          p1: "You can take steps to relieve symptoms, including managing fever and pain with over-the-counter fever reducers, and drinking enough fluids. If your child has RSV, talk to their healthcare provider before giving them non-prescription cold medicine.",
          p2: "Contact your healthcare professional if your symptoms worsen, you are having trouble breathing, or are dehydrated. <0>Learn more about RSV symptoms and care on the CDC website.</0> (cdc.gov/rsv/about/symptoms.html)",
          rsvSymptomsLink: "https://www.cdc.gov/rsv/about/symptoms.html",
        },
      },
      hivNotes: {
        h1: "For HIV:",
        all: {
          p0: "If you have a positive result, you will need a follow-up test to confirm your results. The organization that provided your test should be able to answer questions and provide referrals for follow-up testing.",
          p1: "<0>Visit the CDC website to learn more about a positive HIV result</0> (cdc.gov/hiv/basics/hiv-testing/positive-hiv-results.html)",
          positiveHivLink:
            "https://www.cdc.gov/hiv/basics/hiv-testing/positive-hiv-results.html",
        },
      },
      syphilisNotes: {
        h1: "For syphilis:",
        positive: {
          p0: "If you have a positive result, you will need a follow-up test to confirm your results. The organization that provided your test should be able to answer questions and provide referrals for follow-up testing.",
          p1: "<0>Visit the CDC website to learn more about a positive Syphilis result</0> (cdc.gov/std/treatment-guidelines/syphilis.htm).",
          treatmentLink:
            "https://www.cdc.gov/std/treatment-guidelines/syphilis.htm",
        },
      },
      hepatitisCNotes: {
        h1: "For Hepatitis C:",
        positive: {
          p0: "If you have a positive result, you will need a follow-up test to confirm your results. The organization that provided your test should be able to answer questions and provide referrals for follow-up testing.",
          p1: "<0>Visit the CDC website to learn more about a positive Hepatitis C result</0> (cdc.gov/hepatitis-c/testing/index.html#cdc_testing_results-testing-results).",
          treatmentLink:
            "https://www.cdc.gov/hepatitis-c/testing/index.html#cdc_testing_results-testing-results",
        },
      },
      gonorrheaNotes: {
        h1: "For Gonorrhea:",
        positive: {
          p0: "If you have a positive result, you will need a follow-up test to confirm your results. The organization that provided your test should be able to answer questions and provide referrals for follow-up testing.",
          p1: "<0>Visit the CDC website to learn more about a positive Gonorrhea result.</0> (cdc.gov/gonorrhea/about).",
          treatmentLink: "https://www.cdc.gov/gonorrhea/about/index.html",
        },
      },
      chlamydiaNotes: {
        h1: "For Chlamydia:",
        positive: {
          p0: "If you have a positive result, you will need a follow-up test to confirm your results. The organization that provided your test should be able to answer questions and provide referrals for follow-up testing.",
          p1: "<0>Visit the CDC website to learn more about a positive Chlamydia result.</0> (cdc.gov/chlamydia/about).",
          treatmentLink: "https://www.cdc.gov/chlamydia/about/index.html",
        },
      },
      tos: {
        header: "Terms of service",
        title: "Terms of service",
        introText: `This testing site uses <0>SimpleReport</0> to manage rapid point-of-care testing and reporting. The terms below explain SimpleReport’s policies and terms of service.`,
        consent: "By agreeing, you consent to our terms of service.",
        submit: "I agree",
        document: {
          intro: {
            p0:
              "As a User accessing or using SimpleReport (Application) provided by the Centers for Disease Control and Prevention (CDC) " +
              "and the U.S. Department of Health and Human Services (HHS), in a CDC cloud environment (“CDC Platform”), you acknowledge " +
              "and agree that you are solely responsible for and shall abide by these Terms of Service, as well as any relevant sections " +
              "of <0>CDC’s Privacy Policies</0> (collectively, Terms).",
          },
          scope: {
            heading: "Scope",
            p0:
              "SimpleReport is a free tool that makes it easy for facilities such as health care settings or schools to record and " +
              "quickly transmit public health data to public health departments. It also allows those facilities to enable individuals " +
              "or guardians to access relevant test results. This Application is being provided by HHS and CDC to enable an Entity to " +
              "record its data intake workflow, for record keeping needs and to transmit relevant and necessary data to state, local, " +
              "tribal, and territorial public health authorities (STLT Public Health Agencies) in furtherance of public health " +
              "surveillance and response activities. It also allows the Entity to designate certain users of the data, as set out in " +
              "these Terms. The Application through which the Entity and any users interact with relevant public health data is subject " +
              "to these Terms. Use of the Application constitutes acceptance of these Terms.",
          },
          definitions: {
            heading: "Definitions",
            l0: {
              title: "Entity:",
              definition:
                "A health care provider or facility; testing site; a state, local, tribal, and territorial public health authority " +
                "(STLT Public Health Agency); or other organization that is enrolled in and using Simple Report to record and/or " +
                "transmit data.",
            },
            l1: {
              title: "User:",
              definition:
                "An individual whose personal data is being reported via Simple Report (Individual User), or an individual authorized " +
                "to act on behalf of the Entity under these Terms (Entity User or Entity Administrator). Simple Report will only designate " +
                "one User from the Entity as the Entity Administrator. Entity Administrators will have more detailed identity verification " +
                "than general Entity Users. Once the Entity Administrator has their identity verified, the Entity Administrator can add " +
                "other general Entity Users or Individual Users to the Application. All roles are referred to as “User” for the purposes " +
                "of these Terms, unless otherwise indicated.",
            },
          },
          dataRights: {
            heading: "Data rights and usage",
            subheading: "Accounts/registration",
            section0: "For entity users",
            p01:
              "If you are using the Application on behalf of an Entity as either an Entity Administrator or Entity User, you represent " +
              "and warrant that you have authority to bind that Entity to the Terms and by accepting the Terms, you are doing so on " +
              "behalf of that Entity (and all references to “you” in the Terms refer to you and that Entity).",
            p02:
              "In order to access the Application, as part of the registration process for the Application, and for your continued use " +
              "of the Application, you may be required to provide certain information (such as identification or contact details). Any " +
              "such information you give to CDC or HHS must be accurate and up-to-date. You must inform us promptly of any updates by " +
              "updating your information in the Application or by emailing <0>support@simplereport.gov</0> so that we can keep you informed " +
              "of any changes to the Application or these Terms which may impact your usage of the Application. We may use the contact " +
              "information you provide to contact you regarding usability research for ongoing product and service improvement. Upon " +
              "Entity registration and the creation of Entity User accounts within the Application, credentials (such as passwords, " +
              "keys, tokens, and Entity and Entity User identifications (IDs)) will be issued to you by HHS or CDC. These credentials " +
              "are intended to be used only by you and to identify any software or APIs which you are using. You agree to keep your " +
              "credentials confidential and make reasonable efforts to prevent and discourage other persons from using your credentials.",
            section1: "For entity administrators",
            p1:
              "The Entity Administrator agrees to verify the identity of other Entity Users who are added and to inactivate any other " +
              "Entity Users who should no longer have access. The Administrator also agrees to set permissions appropriately to determine " +
              "the minimum access necessary for each other Entity User to complete their required job duties.",
            section2: "For individual users",
            p2:
              "Entity Administrators will grant Individual Users access to the Application. Individual Users can use the Application " +
              "to access and review their own information or information about others as may be permitted by applicable law (e.g., on " +
              "behalf of a minor or otherwise as a guardian). As noted above, all Users agree to accept and comply with these Terms once " +
              "you register and use the Application. ",
          },
          privacy: {
            heading: "Privacy",
            p0:
              "You may use the Application to search, display, analyze, retrieve, view and/or otherwise ‘get’ information from data you " +
              "are sending (or for Individual Users, for data being sent about you) via the Application and the Platform. Please note " +
              "that the data which you are recording, transmitting or accessing via the Application may be subject to the Privacy Act " +
              "of 1974, the Health Insurance Portability and Accountability Act of 1996 (HIPAA), and other laws, and requires special " +
              "safeguarding. By accessing and using the Application, you agree to strictly abide by all applicable federal and state " +
              "laws regarding the collection, use, protection and disclosure of information obtained or sent through the Application. " +
              "Where Individual Users may be accessing the information on behalf of a minor or otherwise as a guardian, Entity Users and " +
              "Administrator Users agree to assume full responsibility for designating the correct Individual User contact information " +
              "within the Application, in accordance with applicable law. If you would like more information about the application of " +
              "the Privacy Act at CDC, visit the <0>Health and Human Services website</0>.",
            p1:
              "For purposes of use of this Application, if you are a HIPAA-covered entity or acting on behalf of one as a business " +
              "associate or if the data is maintained by you in a HIPAA-covered designated record set, you further acknowledge that you " +
              "will abide by applicable HIPAA regulations (45 CFR Parts 160 and 164) for purposes of appropriate storage, transmission, " +
              "use and disclosure of any protected health information.",
          },
          useOfData: {
            heading: "Use of data",
            p0:
              "This Application is being provided in order to allow for the recording of Entity data, support Entity’s workflow, for " +
              "record keeping purposes, and for transmitting relevant data to STLT Public Health Agencies in furtherance of public health " +
              "surveillance and response activities. HHS and CDC acknowledge that though CDC is providing the Platform, CDC does not " +
              "intend to access the data nor does it intend to review or analyze this data. As such, CDC does not intend to take custody " +
              "or control of data sent via the Application. Entity and Individual Users acknowledge and agree that CDC and Administrative " +
              "Users may manage the data sent via the Application for purposes of operating the CDC Platform (which includes verifying " +
              "user identity) and transmitting to and facilitating use by STLT Public Health Agencies of such data. Except as may be " +
              "required by applicable federal law, CDC may not release the data sent via the Application for other purposes than " +
              "described below.",
          },
          sharingOfData: {
            heading: "Sharing of data",
            p0:
              "Data recorded and stored in the Application by the Entity is for use by the Entity as needed for workflow, record keeping, " +
              "and reporting purposes. Data recorded and stored by the Entity in the Application will be automatically transmitted to the " +
              "appropriate STLT Public Health Agency based on both the Entity ZIP code and the Patient’s ZIP code, including, for coronavirus " +
              "disease 2019 test results, all relevant fields as defined in the <0>HHS COVID-19 Laboratory Reporting Requirements</0>. " +
              "By entering results that are being transmitted to the relevant STLT Public Health Agency or Agencies, the Entity attests " +
              "that it is authorized to report the data via the Application. Though CDC will not actively access and obtain data from the " +
              "Application, Entity, directly or in coordination with the relevant STLT Public Health Agency, may decide to use the " +
              "Application to send deidentified or other as may be determined by Entity, to CDC; such data sent to CDC will be maintained " +
              "consistent with applicable federal laws.",
          },
          otherResponsibilities: {
            heading: "Other responsibilities",
            ul: {
              preheading1: "For all users:",
              li0:
                "You will be fully accountable for all data you submit and will cooperate with CDC or its agents in the event that CDC " +
                "has a security concern with respect to any inquiry, submission, or receipt of data to or from CDC.",
              li1:
                "You will promptly inform CDC in the event you identify misuse of individually identifiable health information or " +
                "protected health information you submit and/or access from the CDC Platform.",
              li2: "You will promptly inform CDC in the event that you can no longer comply with any of the provisions set out in these Terms.",
              li3: "You will immediately cease Application use when you no longer meet any of the terms of these Terms.",
              preheading2: "For entity administrators and entity users:",
              li4:
                "You must adhere to the basic desktop security measures to ensure the security of any individually identifiable information " +
                "or protected health information to which you have access in the Application.",
              li5:
                "As may be required by applicable law you agree to obtain consent from and/or notify individuals whose data will be input " +
                "into the Application that their personal information will be collected and used for public health purposes.",
              li6:
                "When major changes are made to the Application and/or Platform (e.g., disclosure and/or data uses have changed since the " +
                "notice at the time of original collection), you will be notified by email, and are responsible for notifying and obtaining " +
                "consent from individuals whose individually identifiable or protected health information is in the Application.",
              li7:
                "In the unlikely event of a breach, you will be required to notify individuals whose individually identifiable or protected " +
                "health information is in the Application and have been impacted by the breach. Assistance may be offered by CDC to aid in " +
                "this process.",
              li8: "You are required to ensure that anyone using the Application has been trained on handling sensitive and personal information.",
            },
          },
          serviceManagement: {
            heading: "Service management",
            subheading: "Right to Limit",
            p0:
              "Your use of the Application may be subject to certain limitations on access or use as set forth within these Terms or " +
              "otherwise provided by CDC. These limitations are designed to manage the load on the system, promote equitable access, and " +
              "ensure appropriate privacy protections and these limitations may be adjusted without notice, as deemed necessary by CDC. " +
              "If CDC reasonably believes that you have attempted to exceed or circumvent these limits, your ability to use the Application " +
              "may be temporarily or permanently blocked. CDC may monitor your use of the Application to improve the service or to ensure " +
              "compliance with these Terms and reserves the right to deny any User access to the Application at its reasonable discretion.",
          },
          serviceTermination: {
            heading: "Service termination",
            p0:
              "If you wish to terminate your access to and use of the Application, you may do so by deactivating your account (such as by " +
              "contacting your Entity Administrator) or by refraining from further use of the Application.",
            p1:
              "CDC reserves the right (though not the obligation) to: (1) refuse to provide the Application to you, if it is CDC’s opinion " +
              "that use violates any federal law or CDC policy; or (2) terminate or deny you access to and use of all or part of the " +
              "Application at any time for any reason which in CDC’s sole discretion it deems necessary, including to prevent violation of " +
              "federal law or CDC policy. You may petition CDC to regain access to the Application through the support email address " +
              "provided by CDC for the Application. If CDC determines in its sole discretion that the circumstances which led to the " +
              "refusal to provide the Application or terminate access to the Application no longer exist, then CDC may restore your access. " +
              "All provisions of these Terms, which by their nature should survive termination, shall survive termination including, " +
              "without limitation, warranty disclaimers, and limitations of liability.",
          },
          intellectualProperty: {
            heading: "Intellectual property – License grant and restrictions",
            p0:
              "The Application provided to User are for User’s use. User may not modify, copy, distribute, transmit, display, perform, " +
              "reproduce, publish, license, create derivative works from, transfer, or sell any information, software, products, " +
              "or services obtained from CDC. Materials provided by CDC are either owned by or the licensed property of the United States " +
              "Department of Health and Human Services (“HHS”) and the Centers for Disease Control and Prevention (CDC). HHS/CDC grants " +
              "to you a limited, non-exclusive, non-transferable license to access the Application in the United States for the uses set " +
              "forth in these Terms.",
          },
          disclaimerOfWarranties: {
            heading: "Disclaimer of warranties",
            p0:
              "The Application Platform is provided “as is” and on an “as-available” basis. While CDC will do its best to ensure the " +
              "service is available and functional at all times, CDC hereby disclaims all warranties of any kind, express or implied, " +
              "including without limitation the warranties of merchantability, fitness for a particular purpose, and non-infringement. " +
              "CDC makes no warranty that data will be error free or that access thereto will be continuous or uninterrupted.",
          },
          limitationOfLiability: {
            heading: "Limitations on liability",
            p0:
              "To the extent allowed by law, HHS and CDC will not be liable, with respect to any subject matter of these Terms or your " +
              "use of the Application under any contract, negligence, strict liability or other legal or equitable theory for: (1) any " +
              "personal injury, or any special, incidental, indirect or consequential damages; (2) the cost of procurement of substitute " +
              "products or services; or (3) for loss of profits, interruption of use or loss or corruption of data or any other commercial " +
              "damages or losses.",
            p1: "HHS and CDC are not responsible for confidentiality or any information shared by the Entity or other User of the Application.",
          },
          disputes: {
            heading: "Disputes, choice of law, venue, and conflicts",
            p0:
              "Any disputes arising out of these Terms and access to or use of the Application shall be governed by applicable United " +
              "States Federal law. You further agree and consent to the jurisdiction of the Federal Courts located within the District " +
              "of Columbia and the courts of appeal therefrom and waive any claim of lack of jurisdiction or forum non conveniens.",
          },
          indemnification: {
            heading: "Indemnification",
            p0:
              "You agree to indemnify and hold harmless HHS, including CDC, its contractors, employees, agents, and the like, from and " +
              "against any and all claims and expenses, including attorney’s fees, arising out of your use of the Application, including " +
              "but not limited to violation of these Terms.",
          },
          noWaiverOfRights: {
            heading: "No waiver of rights",
            p0: "CDC’s failure to exercise or enforce any right or provision of these Terms shall not constitute waiver of such right or provision.",
          },
          dataAnalytics: {
            heading: "Data analytics and monitoring metrics",
            p0:
              "While using the Application, certain general data analytics on the usage patterns and performance of the Application may be " +
              "gathered and stored automatically to assist with design and development of the Application. This general usage data is not " +
              "linked to an individual’s identity but IP address and device information may be included. Transactions are audited and " +
              "stored for site monitoring, performance, and troubleshooting and may be tied to the individual performing an activity. " +
              "Any such data will be maintained consistent with applicable federal laws.",
          },
        },
      },
      dob: {
        title: "Test result verification",
        header: "Access your COVID-19 test result",
        dateOfBirth: "Date of birth",
        enterDOB: "Enter your date of birth",
        enterDOB2:
          "Enter <0>{{personName}}'s</0> date of birth to access their COVID-19 test result.",
        linkExpirationNotice:
          "Note: this link will expire on <0>{{expirationDate}}</0>. ",
        testingFacilityContact:
          "Please reach out to <0>{{facilityName}}</0> <1>{{facilityPhone}}</1> if you have issues accessing your result.",
        format: "MM/DD/YYYY",
        invalidFormat: "Date of birth must be in MM/DD/YYYY format",
        invalidYear:
          "Date of birth must be after 1900 and before the current year",
        invalidDate: "Date of birth must be a valid date",
        error: "The date of birth entered is incorrect",
        validating: "Validating birth date...",
        linkExpired:
          "This link has expired. Please contact your test provider to generate a new link.",
        linkNotFound:
          "This test result link is invalid. Please double check the URL or contact your test provider for the correct link.",
        exampleText: "For example: 4 28 1986",
        submit: "Continue",
      },
    },
  },
};

export type LanguageConfig = typeof en;
