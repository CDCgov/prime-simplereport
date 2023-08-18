import {loginHooks, testNumber} from "../support/e2e";
import {addMockFacility, whoAmI} from "../utils/testing-data-utils";
import {graphqlURL} from "../utils/request-utils";
import {aliasGraphqlOperations} from "../utils/graphql-test-utils";

loginHooks();
describe("Support admin: manage facility", () => {
  let organizationId="";
  let facilityId = "";
  let facilityCreated = {
    id:"",
    name:`RainbowCenter-${testNumber()}`,
  }

  before(() => {
    addMockFacility(facilityCreated.name).then(response=>{
      facilityCreated.id = response.body.data.addFacility.id;
    });

    whoAmI().then((res) => {
      organizationId = res.body.data.whoami.organization.id;
      facilityId = res.body.data.whoami.organization.facilities[0].id;
    });

    cy.intercept("POST", graphqlURL, (req) => {
      aliasGraphqlOperations(req)
    });
  });

  it("loads a facility", () => {
    cy.visit(`/admin/manage-facility?facility=${facilityId}`);
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
    cy.get("div.bg-base-lightest select").eq(1).select(facilityCreated.id);

    // clicks search button
    cy.get("button").contains("Search").click();

    // displays facility information
    cy.wait("@GetFacilityStats");
    cy.contains(facilityCreated.name);
    cy.contains("Facility information");
    cy.contains("Facility controls");
    cy.checkAccessibility();

    // checks the confirmation modal
    cy.get("button").contains("Delete facility").click();
    cy.contains(`Delete ${facilityCreated.name}`);
    cy.checkAccessibility();
    cy.get("button").contains("No, go back").click();
    cy.contains(`Delete ${facilityCreated.name}`).should("not.exist");
  });

  it("Deletes a facility",()=>{
    cy.get("button").contains("Delete facility").click();
    cy.get("button").contains("Yes, delete facility").click();
    cy.get(".Toastify").contains(`Facility ${facilityCreated.name} successfully deleted`);
  });
});