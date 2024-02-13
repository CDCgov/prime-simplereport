import { loginHooks, testNumber } from "../support/e2e";
import { whoAmI, getOrganizationById } from "../utils/testing-data-utils";
import { graphqlURL } from "../utils/request-utils";
import { aliasGraphqlOperations } from "../utils/graphql-test-utils";
import {
  cleanUpPreviousRunSetupData,
  cleanUpRunOktaOrgs,
  createFacilityName,
  createOrgName,
  setupRunData,
} from "../utils/setup-utils";

const specRunName = "spec10";
const currentSpecRunVersionName = `${testNumber()}-cypress-${specRunName}`;

loginHooks();
describe("Support admin: manage facility", () => {
  const organizationName = createOrgName(currentSpecRunVersionName);
  const facilityName = createFacilityName(currentSpecRunVersionName);
  let facilityId = "";

  before("setup run data", () => {
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

        setupRunData(currentSpecRunVersionName).then((result) => {
          facilityId = result.body.data.addFacility.id;
        });
      },
    );
  });

  beforeEach(() => {
    cy.intercept("POST", graphqlURL, (req) => {
      aliasGraphqlOperations(req);
    });
  });

  after("clean up run data", () => {
    cleanUpRunOktaOrgs(currentSpecRunVersionName);
    cleanUpPreviousRunSetupData(currentSpecRunVersionName);
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

    // selects org combo box
    cy.get('input[role="combobox"]').first().type(`${organizationName}{enter}`);

    // selects facility combo box
    cy.wait("@GetFacilitiesByOrgId");
    cy.get('input[role="combobox"]').last().type(`${facilityName}{enter}`);

    // clicks search button
    cy.get("button").contains("Search").click();

    // displays facility information
    cy.wait("@GetFacilityStats");
    cy.contains(facilityName);
    cy.contains("Facility information");
    cy.contains("Facility controls");
    cy.checkAccessibility();

    // checks the confirmation modal
    cy.get("button").contains("Delete facility").click();
    cy.contains(`Delete ${facilityName}`);
    cy.checkAccessibility();
    cy.get("button").contains("No, go back").click();
    cy.contains(`Delete ${facilityName}`).should("not.exist");
  });

  it("Deletes a facility", () => {
    cy.get("button").contains("Delete facility").click();
    cy.get("button").contains("Yes, delete facility").click();
    cy.get(".Toastify").contains(
      `Facility ${facilityName} successfully deleted`,
    );
  });
});
