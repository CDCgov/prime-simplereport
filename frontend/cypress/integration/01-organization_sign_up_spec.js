const { loginHooks } = require("../support");

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
    cy.get('input[name="name"]').type("Beach Camp");
    cy.get('select[name="state"]').select("CA");
    cy.get('select[name="type"]').select("Camp");
    cy.get('input[name="firstName"]').type("Greg");
    cy.get('input[name="lastName"]').type("McTester");
    cy.get('input[name="email"]').type("greg@mailinator.com");
    cy.get('input[name="workPhoneNumber"]').type("5308675309");
  });
  it("submits successfully", () => {
    cy.get("button.submit-button").click();
    cy.contains("Identity verification consent");
  });
  it("navigates to the support pending org table", () => {
    cy.visit("/admin/pending-organizations");
    cy.get("[data-cy=pending-orgs-title]").should("be.visible");
  });
  it("verifies the org", () => {
    cy.get(".sr-pending-org-edit-verify").first().click();
    cy.get("#verify-button").click();
    cy.contains("Identity verified for Beach Camp", { timeout: 30000 });
  });
  it("spoofs into the org", () => {
    cy.visit("/admin/tenant-data-access");
    cy.get(".usa-card__container")
      .first()
      .within(() => {
        cy.get("select.usa-select").select("Beach Camp");
      });
    cy.get('input[name="justification"]').type("I am a test user");
    cy.contains("Access data").click();
    cy.contains("Support Admin");
  });
  it("navigates to the manage facilities page", () => {
    cy.visit("/settings/facilities");
    cy.contains("Manage facilities");
    cy.contains("+ New facility").click();
    cy.contains("Testing facility information");
  });
  it("fills out the form for a new facility", () => {
    cy.get('input[name="name"]').type("Lifeguard Stand 13");
    cy.get('input[name="phone"]').first().type("5308675309");
    cy.get('input[name="street"]').first().type("123 Beach Way");
    cy.get('input[name="zipCode"]').first().type("90210");
    cy.get('select[name="state"]').first().select("CA");
    cy.get('input[name="cliaNumber"]').type("12D4567890");
    cy.get('input[name="firstName"]').type("Phil");
    cy.get('input[name="lastName"]').type("McTester");
    cy.get('input[name="NPI"]').type("1234567890");
    cy.get('input[name="phone"]').last().type("5308675309");
    cy.contains("Save changes").first().click();
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
