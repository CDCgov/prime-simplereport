const {
  loginHooks,
  generateFacility,
  generateOrganization,
  generateUser,
} = require("../support");

const facility = generateFacility();
const organization = generateOrganization();
const user = generateUser();

describe("Organization sign up", () => {
  loginHooks();
  before(() => {
    // Since these tests interact with Okta, we need to use
    // Wiremock to stub out the Okta API calls.
    cy.task("downloadWiremock");
    cy.restartWiremock("orgSignUp");
  });
  after(() => {
    cy.task("stopWiremock");
  });
  it("navigates to the sign up form", () => {
    cy.visit("/sign-up");
    cy.contains("Sign up for SimpleReport");
    cy.contains("My organization is new to SimpleReport").click();
    cy.contains("Continue").click();
  });
  it("fills out the org info form", () => {
    cy.contains("Sign up for SimpleReport in three steps");
    cy.get('input[name="name"]').type(organization.name);
    cy.get('select[name="state"]').select("CA");
    cy.get('select[name="type"]').select("Camp");
    cy.get('input[name="firstName"]').type("Greg");
    cy.get('input[name="lastName"]').type("McTester");
    cy.get('input[name="email"]').type(user.email);
    cy.get('input[name="workPhoneNumber"]').type("5308675309");
  });
  it("submits successfully", () => {
    cy.get("button.submit-button").click();
    cy.contains("Identity verification consent");
  });
  it("navigates to the support pending org table and verifies the org", () => {
    cy.visit("/admin");
    cy.selectFacility();
    cy.contains("Organizations pending identify verification").click();
    cy.get("[data-cy=pending-orgs-title]").should("be.visible");
    cy.contains("td", `${organization.name}`)
      .siblings()
      .contains("Edit/Verify")
      .click();
    cy.get("#verify-button").click();
    cy.get("#verify-confirmation").click();
    cy.contains(`Identity verified for ${organization.name}`, {
      timeout: 30000,
    });
  });
  it("spoofs into the org", () => {
    cy.visit("/admin");
    cy.selectFacility();
    cy.contains("Organization data").click();
    cy.get("[data-testid='combo-box-input']").clear();
    cy.get("[data-testid='combo-box-input']").type(
      `${organization.name}{enter}`
    );
    cy.get('input[name="justification"]').type("I am a test user").blur();
    cy.contains("Access data").click();
    cy.contains("Support admin");
  });
  it("navigates to the manage facilities page", () => {
    cy.visit("/admin");
    cy.contains("Support admin");
    cy.get("#settings-nav-link").click();
    cy.contains("Manage facilities").click();
    cy.contains("+ New facility").click();
    cy.contains("Testing facility information");
  });
  it("fills out the form for a new facility", () => {
    cy.get('input[name="name"]').type(facility.name);
    cy.get('input[name="phone"]').first().type("5308675309");
    cy.get('input[name="street"]').first().type("123 Beach Way");
    cy.get('input[name="zipCode"]').first().type("90210");
    cy.get('select[name="state"]').first().select("CA");
    cy.get('input[name="cliaNumber"]').type("12D4567890");
    cy.get('input[name="firstName"]').type("Phil");
    cy.get('input[name="lastName"]').type("McTester");
    cy.get('input[name="NPI"]').type("1234567890");
    cy.get('input[name="phone"]').last().type("5308675309");
    cy.contains("Save changes").last().click();
    cy.get(
      '.modal__container input[name="addressSelect-facility"][value="userAddress"]+label'
    ).click();
    cy.get(".modal__container #save-confirmed-address").click();
    cy.contains("+ New facility");
  });
  it("enables adding patients", () => {
    cy.visit("/");
    cy.get("#patient-nav-link").click();
    cy.contains("No results");
  });
});
