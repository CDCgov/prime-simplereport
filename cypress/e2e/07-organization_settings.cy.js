import { loginHooks, testNumber } from "../support/e2e";
import { graphqlURL } from "../utils/request-utils";
import { aliasGraphqlOperations } from "../utils/graphql-test-utils";
import {
  cleanUpPreviousRunSetupData,
  cleanUpRunOktaOrgs,
  setupRunData,
} from "../utils/setup-utils";

const specRunName = "spec07";
const currentSpecRunVersionName = `${testNumber()}-cypress-${specRunName}`;

describe("Updating organization settings", () => {
  before("setup run data", () => {
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

  beforeEach(() => {
    loginHooks();

    cy.intercept("POST", graphqlURL, (req) => {
      aliasGraphqlOperations(req);
    });
  });

  after("clean up run data", () => {
    cleanUpRunOktaOrgs(currentSpecRunVersionName);
    cleanUpPreviousRunSetupData(currentSpecRunVersionName);
  });

  it("navigates to the org settings page", () => {
    cy.visit("/settings/organization");
    cy.wait("@GetCurrentOrganization");
    cy.get(".prime-container.settings-tab").contains("Manage organization");

    // Test a11y on the Manage organization page
    cy.injectSRAxe();
    cy.checkAccessibility();
  });
  it("attempts an empty selection for organization type", () => {
    cy.get('select[name="type"]')
      .find("option:selected")
      .should("have.text", "Camp");
    cy.get('select[name="type"]').select("- Select -");
    cy.contains("Save settings").should("be.enabled").click();
  });
  it("displays a validation toast", () => {
    cy.contains("An organization type must be selected");
  });
  it("attempts a valid selection for organization type", () => {
    cy.get('select[name="type"]').select("Nursing home");
    cy.contains("Save settings").should("be.enabled").click();
    cy.wait("@AdminSetOrganization");
  });
  it("displays a success toast", () => {
    cy.get(".Toastify").contains("Updated organization");
  });
});
