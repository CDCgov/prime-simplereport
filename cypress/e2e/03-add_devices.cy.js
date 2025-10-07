import {
  generateCovidOnlyDevice,
  generateMultiplexDevice,
  loginHooks,
} from "../support/e2e";
import { graphqlURL } from "../utils/request-utils";
import { aliasGraphqlOperations } from "../utils/graphql-test-utils";
const covidOnlyDevice = generateCovidOnlyDevice();
const multiplexDevice = generateMultiplexDevice();

describe("Adding covid only and multiplex devices", () => {
  let facility;
  loginHooks();

  before("store patient info", () => {
    cy.task("setCovidOnlyDeviceName", covidOnlyDevice.name);
    cy.task("setMultiplexDeviceName", multiplexDevice.name);
  });

  context("Add devices", () => {
    beforeEach(() => {
      cy.intercept("POST", graphqlURL, (req) => {
        aliasGraphqlOperations(req);
      });
    });

    it("Adds a covid only device", () => {
      cy.visit("/admin/create-device-type");
      cy.wait("@getSpecimenTypes");
      cy.wait("@getSupportedDiseases");
      cy.contains("Add new device");
      cy.contains("Save changes").should("be.not.enabled");
      cy.injectSRAxe();
      cy.checkAccessibility();
      cy.addDevice(covidOnlyDevice);
    });

    it("Adds a multiplex device", () => {
      cy.visit("/admin/create-device-type");
      cy.wait("@getSpecimenTypes");
      cy.wait("@getSupportedDiseases");
      cy.addDevice(multiplexDevice);
    });

    it("Reviews multiplex device in edit page", () => {
      cy.visit("/admin/manage-devices");
      cy.wait("@getSpecimenTypes");
      cy.wait("@getSupportedDiseases");
      cy.wait("@getDeviceTypeList");

      cy.get('input[role="combobox"]').first().type(multiplexDevice.name);
      cy.get('li[id="selectDevice--list--option-0"]')
        .contains(multiplexDevice.name)
        .click();
      cy.get('input[name="name"]').should("have.value", multiplexDevice.name);
      cy.injectSRAxe();
      cy.checkAccessibility();
      cy.get('input[name="model"]').should("have.value", multiplexDevice.model);
      cy.get('input[name="manufacturer"]').should(
        "have.value",
        multiplexDevice.manufacturer
      );
      cy.get(".pill").should("have.length", 1);
      cy.get('select[name="supportedDiseases.0.supportedDisease"')
        .find(":selected")
        .should("have.text", "COVID-19");
      cy.get('input[name="supportedDiseases.0.testPerformedLoincCode"]').should(
        "have.value",
        "123-456"
      );
      cy.get('select[name="supportedDiseases.1.supportedDisease"')
        .find(":selected")
        .should("have.text", "Flu A");
      cy.get('input[name="supportedDiseases.1.testPerformedLoincCode"]').should(
        "have.value",
        "456-789"
      );
      cy.get('select[name="supportedDiseases.2.supportedDisease"')
        .find(":selected")
        .should("have.text", "Flu B");
      cy.get('input[name="supportedDiseases.2.testPerformedLoincCode"]').should(
        "have.value",
        "789-123"
      );
    });
  });

  context("Manage facilities - add devices", () => {
    beforeEach(() => {
      cy.makePOSTRequest({
        operationName: "WhoAmI",
        variables: {},
        query:
          "query WhoAmI {\n  whoami {\n organization {\n    facilities {\n      id\n      name\n      __typename\n    }\n    __typename\n  }\n} \n}",
      }).then((res) => {
        facility = res.body.data.whoami.organization.facilities[0];
      });
      cy.intercept("POST", graphqlURL, (req) => {
        aliasGraphqlOperations(req);
      });
    });

    it("Adds covid only and multiplex devices to the facility", () => {
      cy.visit(`/settings/facility/${facility.id}`);
      cy.wait("@GetFacilities");
      cy.contains("Manage devices");
      cy.injectSRAxe();
      cy.checkAccessibility();
      cy.get('input[role="combobox"]').first().type(covidOnlyDevice.name);
      cy.get(
        `button[aria-label="Select ${covidOnlyDevice.manufacturer} ${covidOnlyDevice.model}"]`
      ).click();
      cy.get('input[role="combobox"]').first().type(multiplexDevice.name);
      cy.get(
        `button[aria-label="Select ${multiplexDevice.manufacturer} ${multiplexDevice.model}"]`
      ).click();
      cy.contains("Save changes").click();
      cy.get(".modal__content")
        .find("fieldset")
        .each((fieldset) => {
          fieldset.find("label").first().trigger("click");
        });
      cy.get('button[id="save-confirmed-address"]').click();
      cy.wait("@UpdateFacility");
      cy.get(".Toastify").contains("Updated Facility");
      cy.wait("@GetManagedFacilities"); // waits until it goes back to manage facilities page
    });
  });
});
