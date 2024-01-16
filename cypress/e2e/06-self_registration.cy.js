import { loginHooks, generatePatient, testNumber } from "../support/e2e";
import {
  cleanUpPreviousRunSetupData,
  setupRunData,
  cleanUpRunOktaOrgs,
  addDevicesToCreatedFacility,
} from "../utils/setup-utils";

const patient = generatePatient();
const specRunName = "spec06";
const currentSpecRunVersionName = `${testNumber()}-cypress-${specRunName}`;

describe("Patient self registration", () => {
  loginHooks();
  before("store patient info", () => {
    cy.task("setPatientName", patient.fullName);
    cy.task("setPatientDOB", patient.dobForPatientLink);
    cy.task("setPatientPhone", patient.phone);

    cy.task("getSpecRunVersionName", specRunName).then(() => {
      let data = {
        specRunName: specRunName,
        versionName: currentSpecRunVersionName,
      };
      cy.task("setSpecRunVersionName", data);
      setupRunData(currentSpecRunVersionName);
    });
  });

  after("clean up patient info", () => {
    cleanUpPreviousRunSetupData(currentSpecRunVersionName);
    cleanUpRunOktaOrgs(currentSpecRunVersionName, true);
  });

  it("tests the whole patient self registration experience", () => {
    // gets the self registration link and navigates to it

    cy.visit("/settings");
    cy.contains("Patient self-registration").click();
    cy.contains("Patients can now register themselves online");

    // Test a11y on the Patient self registration page
    cy.injectSRAxe();
    cy.checkAccessibility();

    cy.get("#org-link").then(($link) => cy.visit($link.val()));
    cy.contains("Terms of service");

    cy.injectSRAxe();
    cy.checkAccessibility(); // Terms of Service
    cy.contains("I agree").click();
    cy.get("#registration-container").contains("General information");

    cy.checkAccessibility(); // Info form
    // fills out some of the form fields
    cy.get('input[name="firstName"]').type(patient.firstName);
    cy.get('input[name="birthDate"]').type(patient.dobForInput);
    cy.get('input[name="number"]').type(patient.phone);
    cy.get('input[value="MOBILE"]+label').click();
    cy.get('input[name="gender"][value="female"]+label').click();
    cy.get('input[name="genderIdentity"][value="female"]+label').click();
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

    // shows what fields are missing on submit
    cy.get(".self-registration-button").first().click();
    cy.get(".prime-formgroup").contains("Last name is missing");
    cy.get(".prime-formgroup").contains("City is missing");

    // fills out the remaining fields and submits
    cy.get('input[name="lastName"]').type(patient.lastName);
    cy.get('input[name="city"]').type(patient.city);
    cy.get(".self-registration-button").first().click();
    cy.get(
      '.modal__container input[name="addressSelect-person"][value="userAddress"]+label',
    ).scrollIntoView();
    cy.get(
      '.modal__container input[name="addressSelect-person"][value="userAddress"]+label',
    ).click();

    cy.checkAccessibility();

    cy.get(".modal__container #save-confirmed-address").click();
    cy.get("#self-reg-confirmation").contains(
      "thanks for completing your patient profile",
    );

    cy.checkAccessibility(); // Confirmation page
  });
});
