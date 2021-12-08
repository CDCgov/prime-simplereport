describe("Getting a test result from a patient link", () => {
  let patientLink, patientDOB;
  before("retrieve the patient link and dob", () => {
    cy.task("getPatientLink").then((link) => {
      patientLink = link;
    });
    cy.task("getPatientDOB").then((dob) => {
      patientDOB = dob;
    });
  });
  it("successfully navigates to the patient link", () => {
    cy.visit(patientLink);
    cy.contains("Terms of service");
  });
  it("accepts the terms of service", () => {
    cy.contains("I agree").click();
    cy.contains(
      "Enter your date of birth to access your COVID-19 testing portal."
    );
  });
  it("enters the date of birth and submits", () => {
    cy.get('input[name="birthDate"]').type(patientDOB);
    cy.get("#dob-submit-button").click();
  });
  it("shows the test result", () => {
    cy.contains("SARS-CoV-2 result");
    cy.contains("Test result");
    cy.contains("Test date");
    cy.contains("Test device");
  });
});
