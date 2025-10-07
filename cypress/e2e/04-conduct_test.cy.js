import { loginHooks } from "../support/e2e";
import {graphqlURL} from "../utils/request-utils";
import {aliasGraphqlOperations} from "../utils/graphql-test-utils";

describe("Conducting a COVID test", () => {
  let patientName, lastName, covidOnlyDeviceName;
  const queueCard = "div.prime-queue-item:last-of-type";
  loginHooks();

  before("retrieve the patient name and covid device name", () => {
    cy.task("getPatientName").then((name) => {
      patientName = name;
      lastName = patientName.split(",")[0];
    });
    cy.task("getCovidOnlyDeviceName").then((name) => {
      covidOnlyDeviceName = name;
    });
  });

  beforeEach(() => {
    cy.intercept("POST", graphqlURL, (req) => {
      aliasGraphqlOperations(req)
    });
  });

  it("searches for the patient", () => {
    cy.visit("/");
    cy.get(".usa-nav-container");
    cy.get("#desktop-conduct-test-nav-link").click();
    cy.get("#search-field-small").type(lastName);
    cy.get(".results-dropdown").contains(lastName)

    cy.wait("@GetPatientsByFacilityForQueue")

    cy.injectSRAxe();
    cy.checkAccessibility(); // Conduct Tests page
  });
  it("begins a test", () => {
    cy.get(".results-dropdown").within(() => {
      cy.get("button.usa-button--unstyled:first-of-type")
        .contains("Begin test")
        .click();
    });

    cy.get(".ReactModal__Content").contains(
      "Are you experiencing any of the following symptoms?"
    );

    // Test a11y on the AoE modal
    cy.checkAccessibility();
  });
  it("fills out the aoe questions and submits", () => {
    cy.get(".ReactModal__Content").within(() => {
      cy.get('input[name="no_symptoms"][value="no"]+label').click();
      cy.get('input[name="pregnancy"][value="60001007"]+label').click();
      cy.get("#aoe-form-save-button").click();
    });

    cy.wait("@AddPatientToQueue");
    cy.wait("@GetFacilityQueue", {timeout: 20000});

    cy.get(".prime-home").contains(patientName);

    cy.get(queueCard).contains("COVID-19 results");

    cy.checkAccessibility(); // Test Card page
  });
  it("completes the test", () => {
    cy.get(queueCard).within(() => {
      cy.get('select[name="testDevice"]').select(covidOnlyDeviceName);
      cy.get('select[name="testDevice"]').find('option:selected').should('have.text', covidOnlyDeviceName);
    });

    // We cant wait on EditQueueItem after selecting as device
    // because if the covid device was already selected,
    // then it won't trigger a network call
    cy.wait("@GetFacilityQueue", {timeout: 20000});

    cy.get(queueCard).within(() => {
      cy.get('[data-cy="radio-group-option-NEGATIVE"]').click()
    });

    cy.wait("@EditQueueItem");

    cy.get(queueCard).within(() => {
      cy.get(".prime-test-result-submit button").last().should("be.enabled").click();
    });

    cy.wait("@SubmitQueueItem");

    cy.contains(`Result for ${patientName} was saved and reported.`);
    cy.get(".prime-home .grid-container").should("not.have.text", patientName);
  });
  it("shows the result on the results table", () => {
    cy.get("#desktop-results-nav-link").click();
    cy.get(".usa-table").contains(patientName);

    // Test a11y on the Results page
    cy.checkAccessibility();
  });
  it("stores the patient link", () => {
    cy.get(".sr-test-result-row").then(($row) => {
      const patientLink = $row.attr("data-patient-link");
      cy.task("setPatientLink", patientLink);
      cy.task("setPatientName", patientName);
    });
  });
});
