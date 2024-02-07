import { aliasGraphqlOperations } from "../utils/graphql-test-utils";
import {
  generateMultiplexDevice,
  generatePatient,
  loginHooks,
  testNumber,
} from "../support/e2e";
import { graphqlURL } from "../utils/request-utils";
import {
  cleanUpPreviousRunSetupData,
  cleanUpRunOktaOrgs,
  setupMultiplexDevice,
  setupRunData,
  setupPatient,
} from "../utils/setup-utils";

const specRunName = "spec09";
const currentSpecRunVersionName = `${testNumber()}-cypress-${specRunName}`;

loginHooks();
describe("Testing with multiplex devices", () => {
  let facilityId, patientId;
  const patient = generatePatient();
  const multiplexDevice = generateMultiplexDevice();

  before(() => {
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

        setupRunData(currentSpecRunVersionName).then((result) => {
          facilityId = result.body.data.addFacility.id;
        });
        setupPatient(currentSpecRunVersionName, patient).then((result) => {
          patientId = result.internalId;
        });
        setupMultiplexDevice(currentSpecRunVersionName, multiplexDevice);
      },
    );
  });

  beforeEach(() => {
    cy.intercept("POST", graphqlURL, (req) => {
      aliasGraphqlOperations(req);
    });

    // remove a test for the patient if it exists
    cy.makePOSTRequest({
      operationName: "RemovePatientFromQueue",
      variables: { patientId: patientId },
      query:
        "mutation RemovePatientFromQueue($patientId: ID!) {\n  removePatientFromQueue(patientId: $patientId)\n}",
    });
  });

  after("clean up spec data", () => {
    cleanUpPreviousRunSetupData(currentSpecRunVersionName);
    cleanUpRunOktaOrgs(currentSpecRunVersionName);
  });

  it("test patient", () => {
    cy.visit(`/queue?facility=${facilityId}`);
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

    const queueCard = `li[data-testid="test-card-${patientId}"]`;
    cy.get(queueCard).within(() => {
      cy.get('select[name="testDevice"]').select(multiplexDevice.name);
      cy.get('select[name="testDevice"]')
        .find("option:selected")
        .should("have.text", multiplexDevice.name);
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
