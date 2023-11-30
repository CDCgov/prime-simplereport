import { generatePatient, loginHooks, testNumber } from "../support/e2e";
import { graphqlURL } from "../utils/request-utils";
import { aliasGraphqlOperations } from "../utils/graphql-test-utils";

loginHooks();

describe("Save and start covid test", () => {
  let patientName, lastName, phoneNumber, covidOnlyDeviceName;
  before("retrieve the patient info", () => {
    cy.task("getPatientName").then((name) => {
      patientName = name;
      lastName = patientName.split(",")[0];
    });
    cy.task("getPatientPhone").then((phone) => {
      phoneNumber = phone;
    });
    cy.task("getCovidOnlyDeviceName").then((name) => {
      covidOnlyDeviceName = name;
    });
  });

  beforeEach(() => {
    cy.intercept("POST", graphqlURL, (req) => {
      aliasGraphqlOperations(req);
    });
  });

  it("starts and submits a test through the manage patients page", () => {
    cy.visit("/");
    cy.get('[data-cy="desktop-patient-nav-link"]').click();
    cy.get('[data-cy="manage-patients-header"]').contains("Patients");
    cy.get('[data-cy="manage-patients-header"]').contains("Showing");
    cy.get('[data-cy="manage-patients-search-input"]').type(lastName);
    cy.wait("@GetPatientsByFacility");
    cy.get('[data-cy="manage-patients-page"]').contains(patientName);

    // edits the found patient and clicks save and start test
    cy.get(".sr-patient-list").contains(patientName).click();
    cy.contains("General information").should("exist");
    // a11y scan of edit patient page
    cy.injectSRAxe();
    cy.checkAccessibility();

    cy.get('input[name="middleName"]').clear();
    cy.get('input[name="middleName"]').type(testNumber().toString(10));
    cy.get(".prime-save-patient-changes-start-test").click();

    // completes and verifies AoE form and verifies queue
    cy.contains("legend", "Is the patient pregnant?")
      .next("div")
      .within(() => {
        cy.contains("label", "No").click();
      });

    cy.contains("legend", "Is the patient currently experiencing any symptoms?")
      .next("div")
      .within(() => {
        cy.contains("label", "Yes").click();
      });

    cy.contains("label", "When did the patient's symptoms start?")
      .next("input")
      .type("2021-10-05");

    cy.contains("label", "New loss of taste").click();

    cy.get(".prime-home").contains(patientName);
    cy.url().should("include", "queue");

    cy.wait("@GetFacilityQueue", { timeout: 20000 });

    cy.contains("legend", "COVID-19 result")
      .next("div")
      .within(() => {
        cy.contains("label", "Negative (-)").click();
      });

    cy.checkAccessibility();

    cy.contains("Submit results").click();
    cy.wait("@SubmitQueueItem");
  });

  it("starts and submits a test through the save and start option from the patient form", () => {
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

    cy.contains("legend", "COVID-19 result")
      .next("div")
      .within(() => {
        cy.contains("label", "Negative (-)").click();
      });

    cy.contains("Submit results").click();
    cy.wait("@SubmitQueueItem");
  });
  //
  // it("navigates to test queue and edits patient", () => {
  //   cy.visit("/");
  //   cy.get(".usa-nav-container");
  //   cy.get("#desktop-conduct-test-nav-link").click();
  //
  //   cy.wait("@GetFacilityQueue", { timeout: 20000 });
  //
  //   cy.get(".card-name").contains(patientName).click();
  //   cy.get('input[name="middleName"]').clear();
  //   cy.get('input[name="middleName"]').type(testNumber().toString(10));
  //
  //   // clicks save changes and verifies test queue redirect
  //   cy.get(".prime-save-patient-changes").first().click();
  //   cy.wait("@UpdatePatient");
  //   cy.wait("@GetFacilityQueue", { timeout: 20000 });
  //
  //   cy.get(".usa-nav-container");
  //   cy.get("#desktop-patient-nav-link").click();
  //
  //   cy.wait("@GetPatientsByFacility");
  //
  //   cy.get(".sr-patient-list").contains("Loading...").should("not.exist");
  //   cy.get("#search-field-small").type(lastName);
  //   cy.contains("tr", patientName).find(".sr-actions-menu").click();
  //   cy.contains("Start test").click();
  //   cy.wait("@GetFacilityQueue", { timeout: 20000 });
  // });
});
