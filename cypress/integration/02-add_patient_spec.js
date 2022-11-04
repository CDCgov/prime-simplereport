import { generatePatient, loginHooks } from "../support";

const patient = generatePatient();

describe("Adding Patients", () => {
  loginHooks();
  describe("Adding a single patient", () => {
    before("store patient info", () => {
      cy.task("setPatientName", patient.fullName);
      cy.task("setPatientDOB", patient.dobForPatientLink);
      cy.task("setPatientPhone", patient.phone);
    });
    it("navigates to the add patient form", () => {
      cy.visit("/");
      cy.get(".usa-nav-container");
      cy.get("#desktop-patient-nav-link").click();
      cy.get(".prime-container");
      cy.get("#add-patient").click();
      cy.get("#individual_add-patient").click();
      cy.get(".prime-edit-patient").contains("Add new person");
      cy.injectAxe();
      cy.checkA11y(); // Patient form
    });
    it("fills out some of the form fields", () => {
      cy.get('input[name="firstName"]').type(patient.firstName);
      cy.get('input[name="birthDate"]').type(patient.dobForInput);
      cy.get('input[name="number"]').type(patient.phone);
      cy.get('input[value="MOBILE"]+label').click();
      cy.get('input[value="female"]+label').click();
      cy.get('input[name="street"]').type(patient.address);
      cy.get('select[name="state"]').select(patient.state);
      cy.get('input[name="zipCode"]').type(patient.zip);
      cy.get('select[name="role"]').select("STUDENT");
      cy.get(".prime-edit-patient").contains("Student ID");
      cy.get('input[name="lookupId"]').type(patient.studentId);
      cy.get('input[name="race"][value="other"]+label').click();
      cy.get('input[name="ethnicity"][value="refused"]+label').click();
      cy.get('input[name="residentCongregateSetting"][value="NO"]+label').click();
      cy.get('input[name="employedInHealthcare"][value="NO"]+label').click();
    });
    it("shows what fields are missing on submit", () => {
      cy.get(".prime-save-patient-changes").first().click();

      cy.get(".prime-edit-patient").contains("Last name is missing");
      cy.get(".prime-edit-patient").contains("Testing facility is missing");
    });
    it("fills out the remaining fields, submits and checks for the patient", () => {
      cy.get('input[name="lastName"]').type(patient.lastName);
      cy.get('select[name="facilityId"]').select("All facilities");
      cy.get(".prime-save-patient-changes").first().click();
      cy.get(
          '.modal__container input[name="addressSelect-person"][value="userAddress"]+label'
      ).click();

    cy.checkA11y();

      cy.get(".modal__container #save-confirmed-address").click();
      cy.get(".usa-card__header").contains("People");
      cy.get(".usa-card__header").contains("Showing");
      cy.get("#search-field-small").type(patient.lastName);
      cy.get(".prime-container").contains(patient.fullName);

    // failing a11y test
    // error applies to the toast
    // observe this by adding cy.wait(5000); to wait for the toasts to disappear
    // Test a11y on the People page
    cy.checkA11y();
  });
});

  describe("Bulk upload patients", () => {
    const patients = [generatePatient(), generatePatient()];

    const patientToCsv = (patient) => {
      return `${patient.lastName},${patient.firstName},,,refused,${patient.dob},refused,refused,123 Main Street,,Washington,,DC,20008,USA,5656667777,MOBILE,No,No,VISITOR,foo@example.com`
    }
    it("navigates to the bulk upload page", () => {
      cy.visit("/");
      cy.get(".usa-nav-container");
      cy.get("#desktop-patient-nav-link").click();
      cy.get(".prime-container");
      cy.get("#add-patient").click();
      cy.get("#upload_add-patient").click();
      cy.get(".prime-edit-patient").contains("Setup your spreadsheet");
      cy.injectAxe();
      cy.checkA11y(); // Bulk upload patient form
    });
    it("uploads csv file of patients", () => {
      const csvFile = "LastName,FirstName,MiddleName,Suffix,Race,DOB,biologicalSex,Ethnicity,Street,Street2,City,County,State,ZipCode,Country,PhoneNumber,PhoneNumberType,employedInHealthcare,residentCongregateSetting,Role,Email\n"
          + `${patientToCsv(patients[0])}\n`
          + `${patientToCsv(patients[1])}\n`
      cy.get(".usa-radio__label").click(); // select one facility
      cy.get('input[type=file]').selectFile({
        fileContent: csvFile,
        fileName: 'contentData.csv',
        mimeType: 'text/csv',
      }, {
        action: 'drag-drop'
      })
      cy.get(".prime-edit-patient").contains("Success: File Accepted");
    })
    it("patients should appear in the patients list", () => {
      cy.visit("/");
      cy.get(".usa-nav-container");
      cy.get("#desktop-patient-nav-link").click();
      cy.get(".usa-card__header").contains("People");
      cy.get(".usa-card__header").contains("Showing");
      cy.get("#search-field-small").type(patients[0].lastName);
      cy.get(".prime-container").contains(patients[0].fullName);
      cy.get("#search-field-small").clear();
      cy.get("#search-field-small").type(patients[1].lastName);
      cy.get(".prime-container").contains(patients[1].fullName);
    })
  })
})
