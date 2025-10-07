import {aliasGraphqlOperations} from "../utils/graphql-test-utils";
import {loginHooks} from "../support/e2e";
import {graphqlURL} from "../utils/request-utils";

loginHooks();
describe("Testing with multiplex devices", () => {
  let patient, facility, multiplexDeviceName;

  before(() => {
      cy.makePOSTRequest({
        operationName: "WhoAmI",
        variables: {},
        query:
            "query WhoAmI {\n  whoami {\n organization {\n    facilities {\n      id\n      name\n      __typename\n    }\n    __typename\n  }\n} \n}",
      }).then((res) => {
      facility = res.body.data.whoami.organization.facilities[0];
      cy.makePOSTRequest({
        operationName: "GetPatientsByFacility",
        variables: {
          facilityId: facility.id,
          pageNumber: 0,
          pageSize: 1,
          archivedStatus: "UNARCHIVED",
        },
        query:
          "query GetPatientsByFacility($facilityId: ID!, $pageNumber: Int!, $pageSize: Int!, $archivedStatus: ArchivedStatus, $namePrefixMatch: String) {\n  patients(\n    facilityId: $facilityId\n    pageNumber: $pageNumber\n    pageSize: $pageSize\n    archivedStatus: $archivedStatus\n    namePrefixMatch: $namePrefixMatch\n  ) {\n    internalId\n    firstName\n    lastName\n    middleName\n    birthDate\n    isDeleted\n    role\n    lastTest {\n      dateAdded\n      __typename\n    }\n    __typename\n  }\n}",
      }).then((res) => {
        patient = res.body.data.patients[0];
      });
    });

    cy.task("getMultiplexDeviceName").then((name) => {
      multiplexDeviceName = name;
    });
  });

  beforeEach(() => {
    cy.intercept("POST", graphqlURL, (req) => {
      aliasGraphqlOperations(req)
    });

    // remove a test for the patient if it exists
    cy.makePOSTRequest({
      operationName: "RemovePatientFromQueue",
      variables: {patientId: patient.internalId},
      query:
        "mutation RemovePatientFromQueue($patientId: ID!) {\n  removePatientFromQueue(patientId: $patientId)\n}",
    });
  });

  it("test patient", () => {
    cy.visit(`/queue?facility=${facility.id}`);
    cy.wait("@GetFacilityQueue", {timeout: 20000});
    cy.get('input[id="search-field-small"]').type(
      `${patient.lastName}, ${patient.firstName}`
    );
    cy.wait("@GetPatientsByFacilityForQueue");
    cy.contains("Begin test").click();
    cy.get('button[id="aoe-form-save-button"]').click();
    cy.get(".Toastify").contains(`${patient.lastName}, ${patient.firstName}`);
    cy.get(".Toastify").contains(`was added to the queue`);

    cy.contains(`${patient.lastName}, ${patient.firstName}`);
    cy.injectSRAxe();
    cy.checkAccessibility();

    const queueCard = `div[data-testid="test-card-${patient.internalId}"]`;
    cy.get(queueCard).within(() => {
      cy.get('select[name="testDevice"]').select(multiplexDeviceName);
      cy.get('select[name="testDevice"]').find('option:selected').should('have.text', multiplexDeviceName);
    });

    // We cant wait on EditQueueItem after selecting as device
    // because if the multiplex device was already selected,
    // then it won't trigger a network call
    cy.wait("@GetFacilityQueue", {timeout: 20000});

    cy.get(queueCard).within(() => {
      cy.get('button[type="submit"]').as("submitBtn");
      cy.get("@submitBtn").should("be.disabled");
      cy.get(".multiplex-result-form").contains("COVID-19");
      cy.get(".multiplex-result-form").contains("Flu A");
      cy.get(".multiplex-result-form").contains("Flu B");
      cy.get(".multiplex-result-form").contains(
        "Mark test as inconclusive"
      );
      cy.get('input[name="inconclusive-tests"]')
        .should("not.be.checked")
        .should("be.enabled")
        .siblings("label")
        .click();
    });
    cy.wait("@EditQueueItem");

    cy.get(queueCard).within(() => {
      cy.get("@submitBtn").should("be.enabled").click();
    });
    cy.contains("Submit anyway").click();
    cy.wait("@SubmitQueueItem");
    cy.wait("@GetFacilityQueue", {timeout: 20000});
  });
});
