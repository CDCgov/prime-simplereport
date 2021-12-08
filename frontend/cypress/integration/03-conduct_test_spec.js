describe("Conducting a test", () => {
  let patientName, lastName, queueCard;
  before("retrieve the patient name", () => {
    cy.task("getPatientName").then((name) => {
      patientName = name;
      lastName = patientName.split(",")[0];
    });
  });
  it("searches for the patient", () => {
    cy.visit("/");
    cy.get(".usa-nav-container");
    cy.get("#conduct-test-nav-link").click();
    cy.get("#search-field-small").type(lastName);
    cy.get(".results-dropdown").contains(lastName);
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
  });
  it("fills out the pretest questions and submits", () => {
    cy.get(".ReactModal__Content").within(() => {
      cy.get('input[name="no_symptoms"][value="no"]+label').click();
      cy.get('input[name="pregnancy"][value="60001007"]+label').click();
      cy.get("#aoe-form-save-button").click();
    });
    cy.get(".prime-home").contains(patientName);
    queueCard = "div.prime-queue-item:last-of-type";
    cy.get(queueCard).contains("SARS-CoV-2 results");
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
    cy.get("#results-nav-link").click();
    cy.get(".usa-table").contains(patientName);
  });
  it("stores the patient link", () => {
    cy.get(".sr-test-result-row").then(($row) => {
      const patientLink = $row.attr("data-patient-link");
      cy.task("setPatientLink", patientLink);
    });
  });
});
