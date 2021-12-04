import { generatePatient } from "../support";

const patient = generatePatient();

describe("Patient self registration", () => {
  it("navigates to the self registration link and loads terms of service", () => {
    cy.visit("/register/dis-org");
    cy.contains("Terms of service");
  });
  it("accepts the terms of service", () => {
    cy.contains("I agree").click();
    cy.get("#registration-container").contains("General information");
  });
  it("fills out some of the form fields", () => {
    cy.get('input[name="firstName"]').type(patient.firstName);
    cy.get('input[name="birthDate"]').type(patient.dobForInput);
    cy.get('input[name="number"]').type(patient.phone);
    cy.get('input[value="MOBILE"]+label').click();
    cy.get('input[name="street"]').type(patient.address);
    cy.get('select[name="state"]').select(patient.state);
    cy.get('input[name="zipCode"]').type(patient.zip);
    cy.get('select[name="role"]').select("Student");
    cy.get(".prime-formgroup").contains("Student ID");
    cy.get('input[name="lookupId"]').type(patient.studentId);
    cy.get('input[name="residentCongregateSetting"][value="NO"]+label').click();
    cy.get('input[name="employedInHealthcare"][value="NO"]+label').click();
  });
  it("shows what fields are missing on submit", () => {
    cy.get(".self-registration-button").first().click();
    cy.get(".prime-formgroup").contains("Last name is required");
  });
  it("fills out the remaining fields and submits", () => {
    cy.get('input[name="lastName"]').type(patient.lastName);
    cy.get(".self-registration-button").first().click();
    cy.get(
      '.modal__container input[name="addressSelect-person"][value="userAddress"]+label'
    ).click();
    cy.get(".modal__container #save-confirmed-address").click();
    cy.get(".prime-formgroup").contains(
      "thanks for completing your patient profile"
    );
  });
});
