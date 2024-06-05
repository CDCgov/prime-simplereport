import {
  generateCovidOnlyDevice,
  generatePatient,
  loginHooks,
  testNumber,
} from "../support/e2e";
import { graphqlURL } from "../utils/request-utils";
import { aliasGraphqlOperations } from "../utils/graphql-test-utils";
import {
  cleanUpPreviousRunSetupData,
  cleanUpRunOktaOrgs,
  setupCovidOnlyDevice,
  setupRunData,
  setupPatient,
} from "../utils/setup-utils";

const specRunName = "spec04";
const currentSpecRunVersionName = `${testNumber()}-cypress-${specRunName}`;

describe("Conducting a COVID test from:", () => {
  const patient = generatePatient();
  const patientName = patient.fullName;
  const lastName = patient.lastName;
  const covidOnlyDevice = generateCovidOnlyDevice();
  const queueCard = "[data-cy=prime-queue-item]:last-of-type";

  before("setup spec data", () => {
    loginHooks();

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

        setupRunData(currentSpecRunVersionName);
        setupPatient(currentSpecRunVersionName, patient);
        setupCovidOnlyDevice(currentSpecRunVersionName, covidOnlyDevice);
      },
    );
  });

  beforeEach(() => {
    loginHooks();

    cy.intercept("POST", graphqlURL, (req) => {
      aliasGraphqlOperations(req);
    });
  });

  after("clean up spec data", () => {
    cleanUpRunOktaOrgs(currentSpecRunVersionName);
    cleanUpPreviousRunSetupData(currentSpecRunVersionName);
  });

  it("conducts a test from the result page", () => {
    cy.visit("/");
    cy.get(".usa-nav-container");
    cy.get("#desktop-conduct-test-nav-link").click();
    cy.get("#search-field-small").type(lastName);
    cy.get(".results-dropdown").contains(lastName);

    cy.wait("@GetPatientsByFacilityForQueue");

    cy.injectSRAxe();
    cy.get(".results-dropdown").within(() => {
      cy.get("[data-cy='name0-birthdate0']").contains("Begin test").click();
    });

    cy.wait("@AddPatientToQueue");
    cy.wait("@GetFacilityQueue", { timeout: 20000 });

    cy.get(".prime-home").contains(patientName);
    cy.contains("Newly added patients go to the bottom of the queue").click();

    cy.get(queueCard).contains("COVID-19 result");

    cy.get(queueCard).within(() => {
      cy.get('select[name="testDevice"]').select(covidOnlyDevice.name);
      cy.get('select[name="testDevice"]')
        .find("option:selected")
        .should("have.text", covidOnlyDevice.name);
    });

    // We cant wait on EditQueueItem after selecting as device
    // because if the covid device was already selected,
    // then it won't trigger a network call
    cy.wait("@GetFacilityQueue", { timeout: 20000 });

    cy.contains("Submit results").click();
    cy.contains("Please enter a valid test result");
    cy.contains("Invalid test results").click();

    cy.contains("legend", "COVID-19 result")
      .next("div")
      .within(() => {
        cy.contains("label", "Negative (-)").click();
      });

    cy.get(queueCard).within(() => {
      cy.contains("Please enter a valid test result").should("not.exist");
    });

    cy.wait("@EditQueueItem");

    // fill out aoe and submit
    cy.contains("legend", "Is the patient pregnant?")
      .next("div")
      .within(() => {
        cy.contains("label", "Yes").click();
      });

    cy.contains("legend", "Is the patient currently experiencing any symptoms?")
      .next("div")
      .within(() => {
        cy.contains("label", "No").click();
      });

    cy.contains("Select any symptoms the patient is experiencing").should(
      "not.exist",
    );

    cy.contains("legend", "Is the patient currently experiencing any symptoms?")
      .next("div")
      .within(() => {
        cy.contains("label", "Yes").click();
      });

    cy.contains("Select any symptoms the patient is experiencing").should(
      "exist",
    );

    cy.get("[data-testid='symptom-date']").within(() => {
      cy.get("input").type("2021-10-05");
    });

    cy.get("[data-testid='symptom-selection']").within(() => {
      cy.contains("label", "Chills").click();
      cy.contains("label", "Headache").click();
    });

    cy.checkAccessibility();

    cy.contains("Submit results").click();
    cy.wait("@SubmitQueueItem");

    cy.contains(`Result for ${patientName} was saved and reported.`);
    cy.get(".prime-home .grid-container").should("not.have.text", patientName);

    cy.get("#desktop-results-nav-link").click();
    cy.get(".usa-table").contains(patientName);

    cy.checkAccessibility();
  });

  it("starts a test via the manage patients page action menu and then submits a test", () => {
    cy.visit("/");
    cy.get(".usa-nav-container");
    cy.get('[data-cy="desktop-patient-nav-link"]').click();
    cy.get('[data-cy="manage-patients-header"]').contains("Patients");
    cy.get('[data-cy="manage-patients-header"]').contains("Showing");
    cy.get('[data-cy="manage-patients-search-input"]').type(lastName);
    cy.wait("@GetPatientsByFacility");
    cy.get('[data-cy="manage-patients-page"]').contains(patientName);

    cy.contains("tr", `${lastName}, ${patient.firstName}`)
      .contains("More actions")
      .click();
    cy.contains("Start test").click({ force: true });

    cy.wait("@GetFacilityQueue", { timeout: 20000 });
    cy.contains("Newly added patients go to the bottom of the queue").click();

    cy.contains("legend", "COVID-19 result")
      .next("div")
      .within(() => {
        cy.contains("label", "Negative (-)").click();
      });

    cy.contains("legend", "Is the patient pregnant?")
      .next("div")
      .within(() => {
        cy.contains("label", "No").click();
      });

    cy.contains("legend", "Is the patient currently experiencing any symptoms?")
      .next("div")
      .within(() => {
        cy.contains("label", "No").click();
      });

    cy.contains("Submit results").click();
    cy.wait("@SubmitQueueItem");
  });

  it("starts and submits a test for a new patient from the patient form", () => {
    const patient = generatePatient();
    patient.email = "myemail@test.com";

    cy.visit("/");
    cy.get(".usa-nav-container");
    cy.get("#desktop-patient-nav-link").click();
    cy.get("#add-patient").click();
    cy.get("#individual_add-patient").click();
    cy.get(".prime-edit-patient").contains("Add new patient");
    cy.injectSRAxe();
    cy.checkAccessibility(); // New Patient page

    cy.get('input[name="firstName"]').type(patient.firstName);
    cy.get('input[name="lastName"]').type(patient.lastName);
    cy.get('select[name="facilityId"]').select("All facilities");
    cy.get('input[name="birthDate"]').type(patient.dobForInput);
    cy.get('input[name="number"]').type(patient.phone);
    cy.get('input[value="LANDLINE"]+label').click();
    cy.get('input[name="email-0"]').type(patient.email);
    cy.get('input[name="street"]').type(patient.address);
    cy.get('input[name="city"]').type(patient.city);
    cy.get('select[name="state"]').select(patient.state);
    cy.get('input[name="zipCode"]').type(patient.zip);
    cy.get('input[name="race"][value="other"]+label').click();
    cy.get('input[name="ethnicity"][value="refused"]+label').click();
    cy.get('input[name="gender"][value="male"]+label').click();
    cy.get(".prime-save-patient-changes-start-test").first().click();
    cy.get(
      '.modal__container input[name="addressSelect-person"][value="userAddress"]+label',
    ).click();
    cy.checkAccessibility();

    cy.get(".modal__container #save-confirmed-address").click();
    cy.url().should("include", "queue");

    cy.wait("@GetFacilityQueue", { timeout: 20000 });

    cy.get(".prime-home").contains(patient.firstName);
    cy.url().should("include", "queue");
    cy.wait("@GetFacilityQueue", { timeout: 20000 });
    cy.contains("Patient record created").click();
    cy.contains("Newly added patients go to the bottom of the queue").click();

    cy.contains("legend", "COVID-19 result")
      .next("div")
      .within(() => {
        cy.contains("label", "Negative (-)").click();
      });

    cy.contains("legend", "Is the patient pregnant?")
      .next("div")
      .within(() => {
        cy.contains("label", "No").click();
      });

    cy.contains("legend", "Is the patient currently experiencing any symptoms?")
      .next("div")
      .within(() => {
        cy.contains("label", "No").click();
      });

    cy.contains("Submit results").click();
    cy.wait("@SubmitQueueItem");
  });
});
