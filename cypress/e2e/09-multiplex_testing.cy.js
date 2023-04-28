import { aliasMutation, aliasQuery } from "../utils/graphql-test-utils";
import { loginHooks } from "../support/e2e";
import { graphqlURL } from "../utils/request-utils";

describe("Testing with multiplex devices", () => {
  let patient, facility;
  const deviceName = `multiplexDevice-${Date.now()}`;
  loginHooks();

  before(() => {
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
  });

  after(() => {
    //delete the device if it exists
    cy.makePOSTRequest({
      operationName: "MarkDeviceTypeAsDeleted",
      variables: { deviceName: deviceName },
      query:
        "mutation MarkDeviceTypeAsDeleted($deviceName: String){\n  markDeviceTypeAsDeleted(deviceId: null, deviceName: $deviceName)\n{name}}",
    });
  });

  context("Manage device", () => {
    beforeEach(() => {
      cy.intercept("POST", graphqlURL, (req) => {
        aliasQuery(req, "getSpecimenTypes");
        aliasQuery(req, "getSupportedDiseases");
        aliasQuery(req, "getDeviceTypeList");
        aliasQuery(req, "GetManagedFacilities");
        aliasQuery(req, "GetFacilities");

        aliasMutation(req, "createDeviceType");
        aliasMutation(req, "UpdateFacility");
      });
    });

    it("Adds multiplex device", () => {
      cy.visit("/admin/create-device-type");
      cy.wait("@gqlgetSpecimenTypesQuery");
      cy.wait("@gqlgetSupportedDiseasesQuery");
      cy.contains("Device type");
      cy.contains("Save changes").should("be.not.enabled");
      cy.injectSRAxe();
      cy.checkA11y();
      cy.get('input[name="name"]').type(deviceName);
      cy.get('input[name="model"]').type("1RX");
      cy.get('input[name="manufacturer"]').type("acme");
      cy.get('input[name="testLength"]').type("15");
      cy.get('input[role="combobox"]').first().type("Swab");
      cy.get('li[id="multi-select-swabTypes-list--option-1"]').click();
      cy.get('select[name="supportedDiseases.0.supportedDisease"').select("COVID-19");
      cy.get('input[name="supportedDiseases.0.testPerformedLoincCode"]').type("123-456");
      cy.get('input[name="supportedDiseases.0.testOrderedLoincCode"]').type("9500-6");
      cy.contains('.usa-button', "Add another disease").click();
      cy.get('select[name="supportedDiseases.1.supportedDisease"').select("Flu A");
      cy.get('input[name="supportedDiseases.1.testPerformedLoincCode"]').type("456-789");
      cy.get('input[name="supportedDiseases.1.testOrderedLoincCode"]').type("9500-6");
      cy.contains('.usa-button', "Add another disease").click();
      cy.get('select[name="supportedDiseases.2.supportedDisease"').select("Flu B");
      cy.get('input[name="supportedDiseases.2.testPerformedLoincCode"]').type("789-123");
      cy.get('input[name="supportedDiseases.2.testOrderedLoincCode"]').type("9500-6");
      cy.contains("Save changes").should("be.enabled").click();
      cy.wait("@gqlcreateDeviceTypeMutation");
      cy.get(".Toastify").contains("Created Device");
    });

    it("Reviews new multiplex device in edit page", () => {
      cy.visit("/admin/manage-devices");
      cy.wait("@gqlgetSpecimenTypesQuery");
      cy.wait("@gqlgetSupportedDiseasesQuery");
      cy.wait("@gqlgetDeviceTypeListQuery");

      cy.get('input[role="combobox"]').first().type(deviceName);
      cy.get('li[id="selectDevice--list--option-0"]')
        .contains(deviceName)
        .click();
      cy.get('input[name="name"]').should("have.value", deviceName);
      cy.injectSRAxe();
      cy.checkA11y();
      cy.get('input[name="model"]').should("have.value", "1RX");
      cy.get('input[name="manufacturer"]').should("have.value", "acme");
      cy.get(".pill").should("have.length", 1);
      cy.get('select[name="supportedDiseases.0.supportedDisease"').find(":selected").should("have.text", "COVID-19")
      cy.get('input[name="supportedDiseases.0.testPerformedLoincCode"]').should("have.value","123-456")
      cy.get('select[name="supportedDiseases.1.supportedDisease"').find(":selected").should("have.text", "Flu A")
      cy.get('input[name="supportedDiseases.1.testPerformedLoincCode"]').should("have.value","456-789")
      cy.get('select[name="supportedDiseases.2.supportedDisease"').find(":selected").should("have.text", "Flu B")
      cy.get('input[name="supportedDiseases.2.testPerformedLoincCode"]').should("have.value","789-123")
    });

    it("adds the multiplex device to the testing facility", () => {
      cy.visit(`/settings/facility/${facility.id}`);
      cy.wait("@gqlGetFacilitiesQuery");
      cy.contains("Manage devices");
      cy.injectSRAxe();
      cy.checkA11y();
      cy.get('input[role="combobox"]').first().type(deviceName);
      cy.get('li[id="multi-select-deviceTypes-list--option-0"]').click();
      cy.contains("Save changes").click();
      cy.get(".modal__content")
        .find("fieldset")
        .each((fieldset) => {
          fieldset.find("label").first().trigger("click");
        });
      cy.get('button[id="save-confirmed-address"]').click();
      cy.wait("@gqlUpdateFacilityMutation");
      cy.get(".Toastify").contains("Updated Facility");
      cy.wait("@gqlGetManagedFacilitiesQuery"); // waits until it goes back to manage facilities page
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
          cy.get('select[name="testDevice"]').select(deviceName);
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
