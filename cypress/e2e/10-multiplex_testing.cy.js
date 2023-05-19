import { aliasMutation, aliasQuery } from "../utils/graphql-test-utils";
import {loginWithSession} from "../support/e2e";
import { graphqlURL } from "../utils/request-utils";

describe("Testing with multiplex devices", () => {
  let patient, facility, multiplexDeviceName;

  before(() => {
    loginWithSession();
    cy.makePOSTRequest({
      operationName: "GetManagedFacilities",
      variables: {},
      query:
        "query GetManagedFacilities {\n  organization {\n    facilities {\n      id\n      name\n      __typename\n    }\n    __typename\n  }\n}",
    }).then((res) => {
      facility = res.body.data.organization.facilities[0];
      cy.makePOSTRequest({
        operationName: "GetPatientsByFacility",
        variables: {
          facilityId: facility.id,
          pageNumber: 0,
          pageSize: 1,
          includeArchived: false,
        },
        query:
          "query GetPatientsByFacility($facilityId: ID!, $pageNumber: Int!, $pageSize: Int!, $includeArchived: Boolean, $namePrefixMatch: String) {\n  patients(\n    facilityId: $facilityId\n    pageNumber: $pageNumber\n    pageSize: $pageSize\n    includeArchived: $includeArchived\n    namePrefixMatch: $namePrefixMatch\n  ) {\n    internalId\n    firstName\n    lastName\n    middleName\n    birthDate\n    isDeleted\n    role\n    lastTest {\n      dateAdded\n      __typename\n    }\n    __typename\n  }\n}",
      }).then((res) => {
        patient = res.body.data.patients[0];
      });
    });

    cy.task("getMultiplexDeviceName").then((name) => {
      multiplexDeviceName = name;
    });
  });

  after(() => {
    // delete the device if it exists
    cy.makePOSTRequest({
      operationName: "MarkDeviceTypeAsDeleted",
      variables: { deviceName: multiplexDeviceName },
      query:
        "mutation MarkDeviceTypeAsDeleted($deviceName: String){\n  markDeviceTypeAsDeleted(deviceId: null, deviceName: $deviceName)\n{name}}",
    });
  });

  context("Conduct test", () => {
    beforeEach(() => {
      cy.intercept("POST", graphqlURL, (req) => {
        aliasQuery(req, "GetFacilityQueue");
        aliasQuery(req, "GetPatientsByFacilityForQueue");
        aliasQuery(req, "EditQueueItem");
        aliasMutation(req, "SubmitQueueItem");
      });

      // remove a test for the patient if it exists
      cy.makePOSTRequest({
        operationName: "RemovePatientFromQueue",
        variables: { patientId: patient.internalId },
        query:
          "mutation RemovePatientFromQueue($patientId: ID!) {\n  removePatientFromQueue(patientId: $patientId)\n}",
      });
    });

    it("test patient", () => {
      cy.visit(`/queue?facility=${facility.id}`);
      cy.wait("@gqlGetFacilityQueueQuery");
      cy.get('input[id="search-field-small"]').type(
        `${patient.lastName}, ${patient.firstName}`
      );
      cy.wait("@gqlGetPatientsByFacilityForQueueQuery");
      cy.contains("Begin test").click();
      cy.get('button[id="aoe-form-save-button"]').click();
      cy.get(".Toastify").contains(`${patient.lastName}, ${patient.firstName}`);
      cy.get(".Toastify").contains(`was added to the queue`);

      cy.contains(`${patient.lastName}, ${patient.firstName}`);
      cy.injectSRAxe();
      cy.checkA11y();
      cy.get(`div[data-testid="test-card-${patient.internalId}"]`).within(
        () => {
          cy.get('select[name="testDevice"]').select(multiplexDeviceName);
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
            .siblings("label")
            .click();
          cy.wait("@gqlEditQueueItemQuery");
          cy.get('input[name="inconclusive-tests"]').should("be.checked");
          cy.get("@submitBtn").should("be.enabled").click();
        }
      );
      cy.contains("Submit anyway").click();
      cy.wait("@gqlSubmitQueueItemMutation");
      cy.wait("@gqlGetFacilityQueueQuery");
    });
  });
});
