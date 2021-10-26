const YES = "Yes";
const NO = "No";
const OTHER = "Other";
const REFUSED = "Prefer not to answer";
const UNKNOWN = "Unknown";

export const en = {
  translation: {
    header: "COVID-19 Testing Portal",
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
      gender: {
        female: "Female",
        male: "Male",
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
        text:
          "We're sorry, we can't find the page you're looking for. It might have been removed, had its name changed, or is otherwise unavailable.",
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
          helpText:
            "You're responsible for entering the correct contact information, following applicable federal and state laws.",
          primaryPhoneNumber: "Primary phone number",
          additionalPhoneNumber: "Additional phone number",
          phoneType: "Phone type",
          addNumber: "Add another number",
          email: "Email address",
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
          email: "Would you like to receive results at this email?",
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
          genderHelpText:
            "This is usually the gender that is written on your original birth certificate.",
        },
        other: {
          heading: "Other",
          congregateLiving: {
            heading: "Are you a resident in a congregate living setting?",
            helpText:
              "For example: nursing home, group home, prison, jail, or military",
          },
          healthcareWorker: "Are you a health care worker?",
        },
        errors: {
          unsaved:
            "\nYour changes are not yet saved!\n\nClick OK discard changes, Cancel to continue editing.",
          validationMsg: "Please correct before submitting",
          firstName: "First name is required",
          fieldLength: "This answer is too long",
          middleName: "Middle name is incorrectly formatted",
          lastName: "Last name is required",
          lookupId: "Student ID is incorrectly formatted",
          role: "Role is incorrectly formatted",
          facilityId: "Testing facility is required",
          birthDate: {
            base:
              "Date of birth is required, must be in MM/DD/YY format, and in the past",
            past: "Date of birth is too far in the past",
            future: "Date of birth can’t be in the future",
          },
          telephone: "Phone number is missing or invalid",
          phoneNumbers: "Phone numbers are missing or invalid",
          phoneNumbersType: "Phone type is required",
          phoneNumbersDuplicate: "Duplicate phone number entered",
          email: "Email is missing or incorrectly formatted",
          street: "Street is missing",
          streetTwo: "Street 2 is incorrectly formatted",
          zipCode: "ZIP code is missing or incorrectly formatted",
          state: "State is missing or incorrectly formatted",
          city: "City is incorrectly formatted",
          county: "County is incorrectly formatted",
          race: "Race is incorrectly formatted",
          tribalAffiliation: "Tribal affiliation is incorrectly formatted",
          ethnicity: "Ethnicity is incorrectly formatted",
          gender: "Sex assigned at birth is incorrectly formatted",
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
      form: {
        complete: "Registration complete",
        inProgress: "Register for your test",
        error: {
          heading: "Registration error",
          text: "There was a registration error",
        },
      },
      confirmation: {
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
      result: "SARS-CoV-2 result",
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
      specimen: "Specimen ID",
      meaning: "What does my result mean?",
      information:
        "For more information, please visit the <0>Centers for Disease Control and Prevention (CDC) website</0> or contact your local health department.",
      note: "Notes",
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
        meaning:
          "COVID-19 antigen tests can sometimes provid inaccurate or false results and follow up testing may be needed. Continue " +
          "social distancing and wearing a mask. Contact your health care provider to determine if additional " +
          "testing is needed especially if you experience any of these  symptoms.",
        positive: {
          p1:
            "Most people who get COVID-19 will be able to recover at home. Make sure to follow CDC guidelines for people who are recovering at " +
            "home and their caregivers, including:",
          guidelines: {
            li0: "Stay home when you are sick, except to get medical care.",
            li1:
              "Self isolate for 10 full days after symptoms first appeared (or starting the day after you had your test, if you have no symptoms).",
            li2:
              "If you are self isolating at home where others live, use a separate room and bathroom for sick household members (if possible). " +
              "Clean any shared rooms as needed, to avoid transmitting the virus.",
            li3:
              "Wash your hands often with soap and water for at least 20 seconds, especially after blowing your nose, coughing, or sneezing; " +
              "going to the bathroom; and before eating or preparing food.",
            li4:
              "If soap and water are not available, use an alcohol-based hand sanitizer with at least 60% alcohol.",
            li5:
              "Have a supply of clean, disposable face masks. Everyone, no matter their COVID-19 diagnosis, should wear face masks while in the home.",
          },
          p2:
            "Watch for symptoms and <0>learn when to seek emergency medical attention</0>. If someone is showing any of these signs, seek emergency medical care immediately:",
          whenToSeek: "learn when to seek emergency medical attention",
          symptomsLink:
            "cdc.gov/coronavirus/2019-ncov/symptoms-testing/symptoms.html",
          emergency: {
            li0: "Trouble breathing",
            li1: "Persistent chest pain/pressure",
            li2: "Confusion",
            li3: "Inability to wake or stay awake",
            li4: "Bluish lips or face",
          },
          p3:
            "Call 911 or call ahead to your local emergency room: Notify the operator that you are seeking care for someone who has or may have COVID-19.",
          difficultNewsLink:
            "Getting a positive COVID-19 test result can be difficult news, so it’s important to <0> take steps to cope with stress </0> during this time<1></1>. Reach out to your support system and make a phone or video appointment with a mental health professional if needed.",
          difficultNewsURL:
            "cdc.gov/coronavirus/2019-ncov/daily-life-coping/managing-stress-anxiety.html",
          moreInformation:
            "More information is available at cdc.gov/coronavirus/2019-ncov/if-you-are-sick.",
        },
        negative: {
          p0:
            "Contact your health care provider to decide if additional testing is needed, especially if you experience any of these symptoms:",
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
      tos: {
        header: "Terms of service",
        introText: `This testing site uses <0>SimpleReport</0> to manage COVID-19 testing and reporting. The terms below explain SimpleReport’s policies and terms of service.`,
        consent: "By agreeing, you consent to our terms of service.",
        submit: "I agree",
        document: {
          intro: {
            p0:
              "As a Testing Facility (Facility) or its user (Facility User) accessing or using SimpleReport (Application) provided by the " +
              "Centers for Disease Control and Prevention (CDC) and the U.S. Department of Health and Human Services (HHS), in a CDC cloud " +
              'environment (" CDC Platform"), you acknowledge and agree that you are solely responsible for and shall abide by these Terms ' +
              "of Service, as well as any relevant sections of <0>CDC's Privacy Policies</0> (collectively, Terms).",
          },
          scope: {
            heading: "Scope",
            p0:
              "SimpleReport is a free tool that makes it easy for Coronavirus Disease 2019 (COVID-19) testing sites to record results for " +
              "rapid point-of-care tests and quickly report required data to public health departments. This Application is being provided by " +
              "HHS and CDC to enable a Facility to record its testing workflow, for record keeping needs and to route relevant and necessary " +
              "testing data to state, local, tribal, and territorial public health authorities (STLT Public Health Agencies) in furtherance of " +
              "public health response activities related to COVID-19. It also allows Facility to designate certain users of the data, as set " +
              "out in these Terms. The Application through which you interact with relevant public health data is subject to these Terms. Use " +
              "of the Application constitutes acceptance of these Terms.",
          },
          dataRights: {
            heading: "Data Rights and Usage",
            subheading: "Accounts/Registration",
            l0: "General Facility Users",
            p0:
              "If you are using the Application on behalf of a Facility, you represent and warrant that you have authority to bind that " +
              'Facility to the Terms and by accepting the Terms, you are doing so on behalf of that Facility (and all references to "you" in ' +
              "the Terms refer to you and that Facility). In order to access the Application, as part of the registration process for the " +
              "Application, and for your continued use of the Application, you may be required to provide certain information (such as " +
              "identification or contact details). Any such information you give to CDC or HHS must be accurate and up-to-date, and you must " +
              "inform us promptly of any updates so that we can keep you informed of any changes to the Application or these Terms which may " +
              "impact your usage of the Application. Upon Facility registration and the creation of Facility User accounts within the " +
              "Application, credentials (such as passwords, keys, tokens, and Facility and Facility User identifications (IDs)) will be issued " +
              "to you by HHS or CDC. These credentials are intended to be used only by you and to identify any software or APIs which you are " +
              "using. You agree to keep your credentials confidential and make reasonable efforts to prevent and discourage other persons from " +
              "using your credentials.",
            l1: "Administrator User",
            p1:
              "Upon a Facility's registration (and on an ongoing basis, as needed), the Facility must designate at least one user from the " +
              "Facility as the Administrator. This Administrator will have more detailed identity verification. Once the Administrator has " +
              "their identity verified, the Administrator can add other Facility Users to the Application. The Administrator agrees to verify " +
              "identity on Facility Users who are added and to inactivate Facility Users who should no longer have access. The Administrator " +
              "also agree to set permissions appropriately to determine the minimum access necessary for Facility Users to complete their " +
              "required job duties.",
          },
          privacy: {
            heading: "Privacy",
            p0:
              "You may use the Application to search, display, analyze, retrieve, view and otherwise ‘get ' information from data you are " +
              "sending via the Application and the Platform.Please note that the data which you are sending via the Application may be subject " +
              "to the Privacy Act of 1974, the Health Insurance Portability and Accountability Act of 1996 (HIPAA), and other laws, and " +
              "requires special safeguarding.By accessing and using the Application, you agree to strictly abide by all applicable federal and " +
              "state laws regarding the collection, use, protection and disclosure of information obtained or sent through the Application. If " +
              "you would like more information about the application of the Privacy Act at CDC, <0>click here</0>.",
            p1:
              "For purposes of use of this Application, if you are a HIPAA covered entity or acting on behalf of one as a business associate or " +
              "if the data is maintained in a HIPAA-covered designated record set, you further acknowledge that you will abide by applicable " +
              "HIPAA regulations (45 CFR Parts 160 and 164) for purposes of appropriate storage, transmission, use and disclosure of any  " +
              "protected health information.",
          },
          useOfData: {
            heading: "Use of Data",
            p0:
              "This Application is being provided in order to allow for the recording of Facility testing workflow and record keeping needs and " +
              "for the routing of relevant data to STLT Public Health Agencies in furtherance of public health response activities related to " +
              "the COVID-19 pandemic. HHS and CDC acknowledge that though CDC is providing the Platform, CDC does not intend to access the data " +
              "nor does it intend to review or analyze this data. As such, CDC does not intend to take custody or control of data sent via the " +
              "Application. The Facility User acknowledges and agrees that CDC and Administrative Users may manage the data sent via the " +
              "Application for purposes of operating the CDC Platform and transmitting to and facilitating use by STLT Public Health Agencies " +
              "of such data. Except as may be required by applicable federal law, CDC may not release the data sent via the Application for " +
              "other purposes than described below. Should data release be requested of CDC, CDC shall notify the requestor that CDC does not " +
              "have access to this data and refer to requestor to the Facility.",
          },
          sharingOfData: {
            heading: "Sharing of Data",
            p0:
              "Data recorded and stored in the Application is for use by the Facility as needed for workflow, record keeping, and reporting " +
              "purposes. All COVID-19 test results will be automatically reported to the appropriate STLT Public Health Agency based on both " +
              "the testing facility ZIP code and the Patient's ZIP code, including all relevant fields as defined in the <0> HHS COVID-19 " +
              "Laboratory Reporting Requirements</0>. By entering results that are being reported to STLT Public Health Agency, the Facility " +
              "attests that it is authorized to report the data via the Application. Though CDC will not actively access and obtain data from " +
              "the Application, Facility, directly or in coordination with the relevant STLT Public Health Agency, may decide to use the " +
              "Application to send deidentified data to CDC; such data sent to CDC will be maintained consistent with applicable federal laws.",
          },
          otherResponsibilities: {
            heading: "Other Responsibilities",
            ul: {
              li0:
                "You will be fully accountable for all data you submit and will cooperate with CDC or its agents in the event that CDC has a " +
                "security concern with respect to any inquiry, submission, or receipt of data to or from CDC.",
              li1:
                "You will promptly inform CDC in the event you identify misuse of and individually identifiable health information or " +
                "protected health information you submit and/or access from the CDC Platform.",
              li2:
                "You will promptly inform CDC in the event that you can no longer comply with any of the provisions set out in these Terms.",
              li3:
                "You will immediately cease Application use when you no longer meet any of the terms of these Terms.",
              li4:
                "You must adhere to the basic desktop security measures to ensure the security of any individually identifiable information " +
                "or protected health information to which you have access in the Application.",
              li5:
                "As may be required by applicable law you agree to obtain consent from and notify individuals whose data will be input into " +
                "the Application that their personal information will be collected and used for public health purposes.",
              li6:
                "When major changes are made to the Application and/or Platform (e.g., disclosure and/or data uses have changed since the " +
                "notice at the time of original collection), you will be notified by email, and are responsible for notifying and obtaining " +
                "consent from individuals whose individually identifiable or protected health information is in the Application",
              li7:
                "In the unlikely event of a breach, you will be required to notify individuals whose individually identifiable or protected " +
                "health information is in the Application and have been impacted by the breach. Assistance may be offered by CDC to aid in " +
                "this process.",
              li8:
                "You are required to ensure that anyone using the Application has been trained on handling sensitive and personal information.",
            },
          },
          serviceManagement: {
            heading: "Service Management",
            subheading: "Right to Limit",
            p0:
              "Your use of the Application may be subject to certain limitations on access or use as set forth within these Terms or otherwise " +
              "provided by CDC. These limitations are designed to manage the load on the system, promote equitable access, and ensure " +
              "appropriate privacy protections and these limitations may be adjusted without notice, as deemed necessary by CDC. If CDC " +
              "reasonably believes that you have attempted to exceed or circumvent these limits, your ability to use the Application may " +
              "be temporarily or permanently blocked. CDC may monitor your use of the Application to improve the service or to ensure " +
              "compliance with these Terms and reserves the right to deny any User access to the Application at its reasonable discretion.",
          },
          serviceTermination: {
            heading: "Service Termination",
            p0:
              "If you wish to terminate your access to and use of the Application, you may do so by deactivating your account or by refraining " +
              "from further use of the Application.",
            p1:
              "CDC reserves the right (though not the obligation) to: (1) refuse to provide the Application to you, if it is CDC's opinion that " +
              "use violates any federal law or CDC policy; or (2) terminate or deny you access to and use of all or part of the Application at " +
              "any time for any reason which in CDC's sole discretion it deems necessary, including to prevent violation of federal law or " +
              "CDC policy. You may petition CDC to regain access to the Application through the support email address provided by CDC for " +
              "the Application. If CDC determines in its sole discretion that the circumstances which led to the refusal to provide the " +
              "Application or terminate access to the Application no longer exist, then CDC may restore your access. All provisions of these " +
              "Terms, which by their nature should survive termination, shall survive termination including, without limitation, warranty " +
              "disclaimers, and limitations of liability.",
          },
          intellectualProperty: {
            heading: "Intellectual Property – License Grant and Restrictions.",
            p0:
              "The Application provided to User are for User's use. User may not modify, copy, distribute, transmit, display, perform, " +
              "reproduce, publish, license, create derivative works from, transfer, or sell any information, software, products, or services " +
              "obtained from CDC. Material provided by CDC are either owned by or the licensed property of the United States Department of " +
              'Health and Human Services ("HHS") and the Centers for Disease Control and Prevention (CDC). HHS/CDC grants to you a limited, ' +
              "non-exclusive, non-transferable license to access the Application in the United States for the uses set forth in these Terms.",
          },
          disclaimerOfWarranties: {
            heading: "Disclaimer of Warranties",
            p0:
              'The Application Platform is provided "as is" and on an "as-available" basis. While CDC will do its best to ensure the service ' +
              "is available and functional at all times, CDC hereby disclaims all warranties of any kind, express or implied, including " +
              "without limitation the warranties of merchantability, fitness for a particular purpose, and non-infringement. CDC makes no " +
              "warranty that data will be error free or that access thereto will be continuous or uninterrupted.",
          },
          limitationOfLiability: {
            heading: "Limitations on Liability",
            p0:
              "In no event will HHS or CDC be liable with respect to any subject matter of these Terms or your use of the Application under " +
              "any contract, negligence, strict liability or other legal or equitable theory for: (1) any personal injury, or any special, " +
              "incidental, indirect or consequential damages; (2) the cost of procurement of substitute products or services; or (3) for loss " +
              "of profits, interruption of use or loss or corruption of data or any other commercial damages or losses.",
            p1:
              "HHS and CDC are not responsible for confidentiality or any information shared by the Facility or other user of the Application.",
          },
          disputes: {
            heading: "Disputes, Choice of Law, Venue, and Conflicts",
            p0:
              "Any disputes arising out of these Terms and access to or use of the Application shall be governed by applicable United States " +
              "Federal law. You further agree and consent to the jurisdiction of the Federal Courts located within the District of Columbia and " +
              "the courts of appeal therefrom and waive any claim of lack of jurisdiction or forum non conveniens.",
          },
          indemnification: {
            heading: "Indemnification",
            p0:
              "You agree to indemnify and hold harmless HHS, including CDC, its contractors, employees, agents, and the like, from and against " +
              "any and all claims and expenses, including attorney's fees, arising out of your use of the Application, including but not " +
              "limited to violation of these Terms.",
          },
          noWaiverOfRights: {
            heading: "No Waiver of Rights",
            p0:
              "CDC's failure to exercise or enforce any right or provision of these Terms shall not constitute waiver of such right or provision.",
          },
          dataAnalytics: {
            heading: "Data Analytics and Monitoring Metrics",
            p0:
              "While using the Application, certain general data analytics on the usage patterns and performance of the Application may be " +
              "gathered and stored automatically to assist with design and development of the Application. This general usage data is not " +
              "linked to an individual's identity but IP address and device information may be included. Transactions are audited and stored " +
              "for site monitoring, performance, and troubleshooting and may be tied to the individual performing an activity. Any such data " +
              "will be maintained consistent with applicable federal laws.",
          },
        },
      },
      dob: {
        dateOfBirth: "Date of birth",
        enterDOB: "Enter your date of birth",
        enterDOB2:
          "Enter your date of birth to access your COVID-19 testing portal.",
        format: "MM/DD/YYYY",
        invalidFormat: "Date of birth must be in MM/DD/YYYY format",
        invalidYear:
          "Date of birth must be after 1900 and before the current year",
        invalidDate: "Date of birth must be a valid date",
        error: "The date of birth entered is incorrect",
        validating: "Validating birth date...",
        linkExpired:
          "This link has expired. Please contact your test provider.",
        linkNotFound:
          "This test result link is invalid. Please double check the URL or contact your test provider for the correct link.",
        submit: "Continue",
      },
    },
  },
};

export type LanguageConfig = typeof en;
