import {loginHooks} from "../support/e2e";
import {graphqlURL} from "../utils/request-utils";
import {aliasGraphqlOperations} from "../utils/graphql-test-utils";

describe("Support admin: manage facility", () => {
  loginHooks();

  beforeEach(() => {
    cy.intercept("POST", graphqlURL, (req) => {
      aliasGraphqlOperations(req)
    });
  });

  it("loads a facility", () => {
    cy.visit("/admin/manage-facility");
    cy.contains("Manage facility");
    cy.contains("No facility selected");
    cy.injectSRAxe();

    // loads empty page
    cy.checkAccessibility();

    // selects organization
    cy.wait("@GetAllOrganizations");
    cy.get("div.bg-base-lightest select").first().select("Dis Organization");

    // selects facility
    cy.wait("@GetFacilitiesByOrgId");
    cy.get("div.bg-base-lightest select").eq(1).select("Testing Site");

    // displays facility information
    cy.wait("@GetFacilityStats");
    cy.contains("Testing Site");
    cy.contains("Facility information");
    cy.contains("Facility controls");
    cy.checkAccessibility();

    // checks the confirmation modal
    cy.get("button").contains("Delete facility").click();
    cy.contains("Delete Testing Site");
    cy.checkAccessibility();
    cy.get("button").contains("No, go back").click();
    cy.contains("Delete Testing Site").should("not.exist");
  });
});