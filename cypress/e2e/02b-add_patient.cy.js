import { generatePatient, loginHooks, testNumber } from "../support/e2e";
import {
  cleanUpPreviousRunSetupData,
  cleanUpRunOktaOrgs,
  setupOrgFacility,
} from "../utils/setup-utils";

const patient = generatePatient();
const specRunName = "spec02b";
const currentSpecRunVersionName = `${testNumber()}-cypress-${specRunName}`;

describe("Adding a single patient", () => {
  loginHooks();
  before("store patient info", () => {
    // TODO: clean up after no tests rely on this patient
    cy.task("setPatientName", patient.fullName);
    cy.task("setPatientDOB", patient.dobForPatientLink);
    cy.task("setPatientPhone", patient.phone);

    cy.task("getSpecRunVersionName", specRunName).then(
      (prevSpecRunVersionName) => {
        if (prevSpecRunVersionName) {
          cleanUpPreviousRunSetupData(prevSpecRunVersionName);
          // putting this here as well as in the after hook to guarantee
          // the cleanup function runs even if the test gets interrupted
          cleanUpRunOktaOrgs(prevSpecRunVersionName);
        }
        let data = {
          specRunName: specRunName,
          versionName: currentSpecRunVersionName,
        };
        cy.task("setSpecRunVersionName", data);
        setupOrgFacility(currentSpecRunVersionName);
      },
    );
  });

  after(() => {
    cleanUpRunOktaOrgs(currentSpecRunVersionName);
  });

  it("navigates to and fills out add patient form", () => {
    cy.visit("/");
    cy.get('[data-cy="desktop-patient-nav-link"]').click();
    cy.get('[data-cy="add-patients-button"]').click();
    cy.get('[data-cy="individual"]').click();
    cy.get('[data-cy="add-patient-header"]').contains("Add new patient");
    cy.injectSRAxe();
    cy.checkAccessibility(); // empty patient form
    // fill out form
    cy.get('[data-cy="personForm-firstName-input"]').type(patient.firstName);
    cy.get('[data-cy="personForm-dob-input"]').type(patient.dobForInput);
    cy.get('[data-cy="phone-input-0"]').type(patient.phone);
    cy.get('[data-cy="radio-group-option-phoneType-0-MOBILE"]').click();
    cy.get('[data-cy="radio-group-option-genderIdentity-female"]').click();
    cy.get('[data-cy="radio-group-option-gender-female"]').click();
    cy.get('[data-cy="street-input"]').type(patient.address);
    cy.get('[data-cy="state-input"]').select(patient.state);
    cy.get('[data-cy="zip-input"]').type(patient.zip);
    cy.get('[data-cy="personForm-role-input"]').select("STUDENT");
    cy.get('[data-cy="add-patient-page"]').contains("Student ID");
    cy.get('[data-cy="personForm-lookupId-input"]').type(patient.studentId);
    cy.get('[data-cy="radio-group-option-race-other"]').click();
    cy.get('[data-cy="radio-group-option-ethnicity-refused"]').click();
    cy.get(
      '[data-cy="radio-group-option-residentCongregateSetting-NO"]',
    ).click();
    cy.get('[data-cy="radio-group-option-employedInHealthcare-NO"]').click();
    cy.get('[data-cy="add-patient-save-button"]').eq(0).click();
    // check for errors
    cy.get('[data-cy="add-patient-page"]').contains("Last name is missing");
    cy.get('[data-cy="add-patient-page"]').contains(
      "Testing facility is missing",
    );
    cy.get('[data-cy="add-patient-page"]').contains("City is missing");
    cy.checkAccessibility(); // patient form with errors
    // fill out remaining form
    cy.get('[data-cy="personForm-lastName-input"]').type(patient.lastName);
    cy.get('[data-cy="city-input"]').type(patient.city);
    cy.get('[data-cy="personForm-facility-input"]').select("All facilities");
    cy.get('[data-cy="add-patient-save-button"]').eq(0).click();
    cy.get(
      '[data-cy="radio-group-option-addressSelect-person-userAddress"]',
    ).click();
    cy.checkAccessibility(); // address validation modal
    cy.get('[data-cy="save-address-confirmation-button"]').click();
    // check for newly created patient on Manage Patients page
    cy.get('[data-cy="manage-patients-header"]').contains("Patients");
    cy.get('[data-cy="manage-patients-header"]').contains("Showing");
    cy.get('[data-cy="manage-patients-search-input"]').type(patient.lastName);
    cy.get('[data-cy="manage-patients-page"]').contains(patient.fullName);
    cy.checkAccessibility(); // manage patients page
  });
});
