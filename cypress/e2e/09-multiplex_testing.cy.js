import { aliasGraphqlOperations } from "../utils/graphql-test-utils";
import {
  generateMultiplexDevice,
  generatePatient,
  loginHooks,
  testNumber,
} from "../support/e2e";
import { graphqlURL } from "../utils/request-utils";
import {
  setupRunData,
  cleanUpPreviousRunSetupData,
  cleanUpRunOktaOrgs,
  createFacilityName,
  getCreatedFacility,
} from "../utils/setup-utils";
import { getOrganizationsByName } from "../utils/testing-data-utils";

loginHooks();
const specRunName = "spec09";
const currentSpecRunVersionName = `${testNumber()}-cypress-${specRunName}`;
const patient = generatePatient();
const multiplexDeviceName = generateMultiplexDevice();
describe("Testing with multiplex devices", () => {
  let facility;

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
      getCreatedFacility(currentSpecRunVersionName).then((res) => {
        facility = res;
      });
    });
  });

  beforeEach(() => {
    cy.intercept("POST", graphqlURL, (req) => {
      aliasGraphqlOperations(req);
    });

    // remove a test for the patient if it exists
    cy.makePOSTRequest({
      operationName: "RemovePatientFromQueue",
      variables: { patientId: patient.internalId },
      query:
        "mutation RemovePatientFromQueue($patientId: ID!) {\n  removePatientFromQueue(patientId: $patientId)\n}",
    });
  });

  after(() => {
    cleanUpPreviousRunSetupData(currentSpecRunVersionName);
    cleanUpRunOktaOrgs(currentSpecRunVersionName, true);
  });

  it("test patient", () => {
    cy.visit(`/queue?facility=${facility.id}`);
    cy.wait("@GetFacilityQueue", { timeout: 20000 });
    cy.get('input[id="search-field-small"]').type(
      `${patient.lastName}, ${patient.firstName}`,
    );
    cy.wait("@GetPatientsByFacilityForQueue");
    cy.contains("Begin test").click();
    cy.get(".Toastify").contains(`${patient.lastName}, ${patient.firstName}`);
    cy.get(".Toastify").contains(`was added to the queue`);

    cy.contains(`${patient.lastName}, ${patient.firstName}`);
    cy.injectSRAxe();
    cy.checkAccessibility();

    const queueCard = `li[data-testid="test-card-${patient.internalId}"]`;
    cy.get(queueCard).within(() => {
      cy.get('select[name="testDevice"]').select(multiplexDeviceName);
      cy.get('select[name="testDevice"]')
        .find("option:selected")
        .should("have.text", multiplexDeviceName);
    });

    // We cant wait on EditQueueItem after selecting as device
    // because if the multiplex device was already selected,
    // then it won't trigger a network call
    cy.wait("@GetFacilityQueue", { timeout: 20000 });

    cy.contains("Submit results").click();
    cy.contains("Please enter a valid test result");
    cy.contains("Invalid test results");

    cy.contains("legend", "Flu A result")
      .next("div")
      .within(() => {
        cy.contains("label", "Inconclusive").click();
      });

    cy.get(queueCard).within(() => {
      cy.contains("Please enter a valid test result").should("not.exist");
    });

    cy.wait("@EditQueueItem");

    cy.contains("Submit results").click();
    cy.contains("Submit anyway").click();

    cy.wait("@SubmitQueueItem");
    cy.wait("@GetFacilityQueue", { timeout: 20000 });
  });
});
