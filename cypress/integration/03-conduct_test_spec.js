import { loginHooks } from "../support";

describe("Conducting a COVID test", () => {
  let patientName, lastName, queueCard;
  loginHooks();
  before("retrieve the patient name", () => {
    cy.task("getPatientName").then((name) => {
      patientName = name;
      lastName = patientName.split(",")[0];
    });
  });
  it("searches for the patient", () => {
    cy.visit("/");
    cy.get(".usa-nav-container");
    cy.get("#desktop-conduct-test-nav-link").click();
    cy.get("#search-field-small").type(lastName);
    cy.get(".results-dropdown").contains(lastName)

    cy.injectAxe();
    cy.checkA11y(); // Conduct Tests page
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
    cy.checkA11y();
  });
  it("fills out the pretest questions and submits", () => {
    cy.get(".ReactModal__Content").within(() => {
      cy.get('input[name="no_symptoms"][value="no"]+label').click();
      cy.get('input[name="pregnancy"][value="60001007"]+label').click();
      cy.get("#aoe-form-save-button").click();
    });
    cy.get(".prime-home").contains(patientName);
    queueCard = "div.prime-queue-item:last-of-type";
    cy.get(queueCard).contains("COVID-19 results");

    cy.checkA11y(); // Test Card page
  });
  it("completes the test", () => {
    cy.get(queueCard).within(() => {
      cy.get('.prime-radios input[value="NEGATIVE"]+label').click();
      cy.get(".prime-test-result-submit button").click();
    });
    cy.contains(`Result was saved and reported for ${patientName}`);
    cy.get(".prime-home .grid-container").should("not.have.text", patientName);
  });
  it("shows the result on the results table", () => {
    cy.get("#desktop-results-nav-link").click();
    cy.get(".usa-table").contains(patientName);

    // Test a11y on the Results page
    cy.checkA11y();
  });
  it("stores the patient link", () => {
    cy.get(".sr-test-result-row").then(($row) => {
      const patientLink = $row.attr("data-patient-link");
      cy.task("setPatientLink", patientLink);
      cy.task("setPatientName", patientName);
    });
  });
});
