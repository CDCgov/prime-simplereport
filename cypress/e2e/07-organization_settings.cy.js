import {loginHooks} from "../support/e2e";
import {graphqlURL} from "../utils/request-utils";
import {aliasGraphqlOperations} from "../utils/graphql-test-utils";

describe("Updating organization settings", () => {
  loginHooks();
  beforeEach(() => {
    cy.intercept('POST', graphqlURL, (req) => {
      aliasGraphqlOperations(req)
    });
  });

  it("navigates to the org settings page", () => {
    cy.visit("/settings/organization");
    cy.wait("@GetOrganization");
    cy.get(".prime-container.settings-tab").contains("Manage organization");

    // Test a11y on the Manage organization page
    cy.injectSRAxe();
    cy.checkA11y();
  });
  it("attempts an empty selection for organization type", () => {
    cy.get('select[name="type"]').select("- Select -");
    cy.contains("Save settings").click();
  });
  it("displays a validation toast", () => {
    cy.contains("An organization type must be selected");
  });
  it("attempts a valid selection for organization type", () => {
    cy.get('select[name="type"]').select("Nursing home");
    cy.contains("Save settings").click();
  });
  it("displays a success toast", () => {
    cy.get(".Toastify").contains("Updated organization");
  });
});
