const dayjs = require("dayjs");

describe("Getting a test result from a patient link", () => {
  let patientLink, patientDOB, patientObfuscatedName;
  before("retrieve the patient link and dob", () => {
    cy.task("getPatientLink").then((link) => {
      patientLink = link;
    });
    cy.task("getPatientDOB").then((dob) => {
      patientDOB = dob;
    });
    cy.task("getPatientName").then((name) => {
      const [lastName, firstName] = name.split(",");
      patientObfuscatedName = firstName + " " + lastName[0] + ".";
    });
  });
  it("successfully navigates to the patient link", () => {
    cy.visit(patientLink);
  });
  it("contains no accessibility issues", () => {
    cy.injectSRAxe();
    cy.checkAccessibility(); // PXP page
  });
  it("accepts the terms of service", () => {
    cy.contains("Terms of service");
    cy.contains("I agree").click();
  });
  it("enters the date of birth and submits", () => {
    cy.contains("Access your COVID-19 test result");

    // This sentence is broken into multiple lines due to how the i18n
    // library interpolates the patient name variable
    cy.contains("Enter ");
    cy.contains(`${patientObfuscatedName}'s`);
    cy.contains("date of birth to access their COVID-19 test result.");
    const dob = dayjs(patientDOB, "MM/DD/YYYY");
    // Month is zero-indexed, so add 1
    const birthMonth = dob.month() + 1;
    const birthDay = dob.date();
    const birthYear = dob.year();

    cy.checkAccessibility(); // DoB entry page

    cy.get('input[name="month"]').type(birthMonth);
    cy.get('input[name="day"]').type(birthDay);
    cy.get('input[name="year"]').type(birthYear);
    cy.get("#dob-submit-button").click();
  });
  it("shows the test result", () => {
    cy.contains("Test result: COVID-19");
    cy.contains("Test result");
    cy.contains("Test date");
    cy.contains("Test device");

    cy.checkAccessibility(); // Result page
  });
});
