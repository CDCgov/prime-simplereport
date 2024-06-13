import {
  generateCovidOnlyDevice,
  generateMultiplexDevice,
  loginHooks,
  testNumber,
} from "../support/e2e";
import { graphqlURL } from "../utils/request-utils";
import { aliasGraphqlOperations } from "../utils/graphql-test-utils";
import {
  accessOrganizationByName,
  cleanUpPreviousRunSetupData,
  cleanUpRunOktaOrgs,
  setupRunData,
} from "../utils/setup-utils";

const specRunName = "spec03";
const currentSpecRunVersionName = `${testNumber()}-cypress-${specRunName}`;

describe("Adding testing devices", () => {
  const covidOnlyDevice = generateCovidOnlyDevice();
  const multiplexDevice = generateMultiplexDevice();

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
      },
    );
  });

  beforeEach("alias graphql operations", () => {
    loginHooks();

    cy.intercept("POST", graphqlURL, (req) => {
      aliasGraphqlOperations(req);
    });
  });

  after("clean up spec data", () => {
    cleanUpPreviousRunSetupData(currentSpecRunVersionName);
    cleanUpRunOktaOrgs(currentSpecRunVersionName);
  });

  it("Adds devices to SimpleReport via admin dashboard", () => {
    visitAdminCreateDevicePage();
    cy.contains("Add new device");
    cy.contains("Save changes").should("be.not.enabled");
    cy.injectSRAxe();
    cy.checkAccessibility();
    cy.addDevice(covidOnlyDevice);

    visitAdminCreateDevicePage();
    cy.addDevice(multiplexDevice);

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
      multiplexDevice.manufacturer,
    );
    cy.get(".pill").should("have.length", 1);
    cy.get('select[name="supportedDiseases.0.supportedDisease"')
      .find(":selected")
      .should("have.text", "COVID-19");
    cy.get('input[name="supportedDiseases.0.testPerformedLoincCode"]').should(
      "have.value",
      "123-456",
    );
    cy.get('select[name="supportedDiseases.1.supportedDisease"')
      .find(":selected")
      .should("have.text", "Flu A");
    cy.get('input[name="supportedDiseases.1.testPerformedLoincCode"]').should(
      "have.value",
      "456-789",
    );
    cy.get('select[name="supportedDiseases.2.supportedDisease"')
      .find(":selected")
      .should("have.text", "Flu B");
    cy.get('input[name="supportedDiseases.2.testPerformedLoincCode"]').should(
      "have.value",
      "789-123",
    );
  });

  it("Adds devices to a testing facility", () => {
    accessOrganizationByName(`${currentSpecRunVersionName}-org`);
    cy.visit(`/settings/facilities`);
    cy.get(`[data-cy="${currentSpecRunVersionName}-facility-link"]`).click();
    cy.contains("Manage devices");
    cy.injectSRAxe();
    cy.checkAccessibility();
    cy.get('input[role="combobox"]').first().type(covidOnlyDevice.name);
    cy.get(
      `button[aria-label="Select ${covidOnlyDevice.manufacturer} ${covidOnlyDevice.model}"]`,
    ).click();
    cy.get('input[role="combobox"]').first().type(multiplexDevice.name);
    cy.get(
      `button[aria-label="Select ${multiplexDevice.manufacturer} ${multiplexDevice.model}"]`,
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

const visitAdminCreateDevicePage = () => {
  cy.visit("/admin/create-device-type");
  cy.wait("@getSpecimenTypes");
  cy.wait("@getSupportedDiseases");
};
