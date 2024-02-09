const dayjs = require("dayjs");
const { getPatientLinkByTestEventId } = require("../utils/testing-data-utils");
const {
  loginHooks,
  testNumber,
  generatePatient,
  generateCovidOnlyDevice,
} = require("../support/e2e");
const { frontendURL } = require("../utils/request-utils");
const {
  cleanUpPreviousRunSetupData,
  setupRunData,
  setupPatient,
  setupCovidOnlyDevice,
  cleanUpRunOktaOrgs,
  setupTestOrder,
} = require("../utils/setup-utils");

const specRunName = "spec05";
const currentSpecRunVersionName = `${testNumber()}-cypress-${specRunName}`;

loginHooks();
describe("Getting a test result from a patient link", () => {
  const patient = generatePatient();
  const covidOnlyDevice = generateCovidOnlyDevice();
  const patientDOB = patient.dobForPatientLink;
  const patientObfuscatedName =
    patient.firstName + " " + patient.lastName[0] + ".";
  let patientLink;

  before("setup spec data", () => {
    cy.task("getSpecRunVersionName", specRunName).then(
      (prevSpecRunVersionName) => {
        if (prevSpecRunVersionName) {
          cleanUpPreviousRunSetupData(prevSpecRunVersionName);
          cleanUpRunOktaOrgs(prevSpecRunVersionName);
        }
        let data = {
          specRunName: specRunName,
          versionName: currentSpecRunVersionName,
        };
        cy.task("setSpecRunVersionName", data);
        let patientId, createdDeviceId, specimenTypeId, testEventId;
        setupRunData(currentSpecRunVersionName)
          .then(() => setupPatient(currentSpecRunVersionName, patient))
          .then((result) => {
            patientId = result.internalId;
          })
          .then(() =>
            setupCovidOnlyDevice(currentSpecRunVersionName, covidOnlyDevice),
          )
          .then((result) => {
            createdDeviceId = result.createdDeviceId;
            specimenTypeId = result.specimenTypeId;
          })
          .then(() =>
            setupTestOrder(
              currentSpecRunVersionName,
              patientId,
              createdDeviceId,
              specimenTypeId,
            ),
          )
          .then((result) => {
            testEventId = result.body.data.submitQueueItem.testEventId;
          })
          .then(() => getPatientLinkByTestEventId(testEventId))
          .then((result) => {
            const patientLinkId =
              result.body.data.testResult.patientLink.internalId;

            patientLink = `${frontendURL}pxp?plid=${patientLinkId}`;
          });
      },
    );
  });

  after("clean up spec data", () => {
    cleanUpPreviousRunSetupData(currentSpecRunVersionName);
    cleanUpRunOktaOrgs(currentSpecRunVersionName);
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
    cy.contains("Test result");
    cy.contains("Test date");
    cy.contains("Test device");

    cy.checkAccessibility(); // Result page
  });
});
