import { loginHooks, generatePatient } from "../support";

const patient = generatePatient();

describe("Patient self registration", () => {
  loginHooks();
  it("gets the self registration link and navigates to it", () => {
    cy.visit("/settings");
    cy.contains("Patient self-registration").click();
    cy.contains("Patients can now register themselves online");

    // failing a11y test
    // Test a11y on the Patient self registration page
    cy.injectAxe();
    cy.checkA11y(
        {
          exclude: [],
        },
        {
          rules: {
            'button-name': { enabled: false },
            'page-has-heading-one': { enabled: false },
          },
        },
    );

    cy.get("#org-link").then(($link) => cy.visit($link.val()));
  });
  it("loads terms of service", () => {
    cy.contains("Terms of service");

    cy.injectAxe();
    cy.checkA11y(); // Terms of Service
  });
  it("accepts the terms of service", () => {
    cy.contains("I agree").click();
    cy.get("#registration-container").contains("General information");

    cy.checkA11y(); // Info form
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
    cy.get('select[name="role"]').select("Student");
    cy.get(".prime-formgroup").contains("Student ID");
    cy.get('input[name="lookupId"]').type(patient.studentId);
    cy.get('input[name="race"][value="other"]+label').click();
    cy.get('input[name="ethnicity"][value="refused"]+label').click();
    cy.get('input[name="residentCongregateSetting"][value="NO"]+label').click();
    cy.get('input[name="employedInHealthcare"][value="NO"]+label').click();
  });
  it("shows what fields are missing on submit", () => {
    cy.get(".self-registration-button").first().click();
    cy.get(".prime-formgroup").contains("Last name is missing");
  });
  it("fills out the remaining fields and submits", () => {
    cy.get('input[name="lastName"]').type(patient.lastName);
    cy.get(".self-registration-button").first().click();
    cy.get(
      '.modal__container input[name="addressSelect-person"][value="userAddress"]+label'
    ).click();

    // failing a11y test
    // Also found in specs 01, 02, 05, 08
    // Test a11y on the confirm address modal
    cy.checkA11y(
        {
          exclude: [],
        },
        {
          rules: {
            'aria-dialog-name': { enabled: false },
            'landmark-one-main': { enabled: false },
            'page-has-heading-one': { enabled: false },
          },
        },
    );

    cy.get(".modal__container #save-confirmed-address").click();
    cy.get("#self-reg-confirmation").contains(
      "thanks for completing your patient profile"
    );

    cy.checkA11y(); // Confirmation page
  });
});
