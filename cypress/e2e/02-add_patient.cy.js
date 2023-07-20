import { generatePatient, loginHooks } from "../support/e2e";

const patient = generatePatient();

describe("Adding a single patient", () => {
  loginHooks();
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
    cy.get(".prime-edit-patient").contains("Add new patient");
    cy.injectSRAxe();
    cy.checkAccessibility(); // Patient form
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
    cy.get(".prime-edit-patient").contains("City is missing");
  });
it("fills out the remaining fields, submits and checks for the patient", () => {
  cy.get('input[name="lastName"]').type(patient.lastName);
  cy.get('input[name="city"]').type(patient.city);
  cy.get('select[name="facilityId"]').select("All facilities");
  cy.get(".prime-save-patient-changes").first().click();
  cy.get(
    '.modal__container input[name="addressSelect-person"][value="userAddress"]+label'
  ).click();

    cy.checkAccessibility();

    cy.get(".modal__container #save-confirmed-address").click();
    cy.get(".usa-card__header").contains("Patients");
    cy.get(".usa-card__header").contains("Showing");
    cy.get("#search-field-small").type(patient.lastName);
    cy.get(".prime-container").contains(patient.fullName);

    cy.checkAccessibility();
  });
});
