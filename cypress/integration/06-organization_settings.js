import {loginHooks} from "../support";
import {graphqlURL} from "../utils/request-utils";
import {aliasQuery} from "../utils/graphql-test-utils";

describe("Updating organization settings", () => {
  loginHooks();
  beforeEach(() => {
    cy.intercept('POST', graphqlURL, (req) => {
      aliasQuery(req, 'GetOrganization')
    });
  });

  it("navigates to the org settings page", () => {
    cy.visit("/settings/organization");
    cy.wait("@gqlGetOrganizationQuery");
    cy.get(".prime-container.settings-tab").contains("Manage organization");

    // Test a11y on the Manage organization page
    cy.injectAxe();
    cy.checkA11y();
  });
  it("attempts an empty selection for organization type", () => {
    cy.get('select[name="type"]').select("- Select -");
    cy.contains("Save settings").click();
  });
  it("displays a validation toast", () => {
    cy.get(".Toastify").contains("An organization type must be selected");
  });
  it("attempts a valid selection for organization type", () => {
    cy.get('select[name="type"]').select("Nursing home");
    cy.contains("Save settings").click();
  });
  it("displays a success toast", () => {
    cy.get(".Toastify").contains("Updated organization");
  });
});
