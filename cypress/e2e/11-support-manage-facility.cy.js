import {loginHooks} from "../support/e2e";
import {graphqlURL} from "../utils/request-utils";
import {aliasGraphqlOperations} from "../utils/graphql-test-utils";

loginHooks();
describe("Support admin: manage facility", () => {
  let organizationId="";
  let facilityId = "";

  before(() => {
    cy.intercept("POST", graphqlURL, (req) => {
      aliasGraphqlOperations(req)
    });

    cy.makePOSTRequest({
      operationName: "WhoAmI",
      variables: {},
      query:
        "query WhoAmI {\n  whoami {\n organization {\n  id\n  facilities {\n      id\n    }\n  }\n} \n}",
    }).then((res) => {
      organizationId = res.body.data.whoami.organization.id;
      facilityId = res.body.data.whoami.organization.facilities[0].id;
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
    cy.get("div.bg-base-lightest select").first().select(organizationId);

    // selects facility
    cy.wait("@GetFacilitiesByOrgId");
    cy.get("div.bg-base-lightest select").eq(1).select(facilityId);

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