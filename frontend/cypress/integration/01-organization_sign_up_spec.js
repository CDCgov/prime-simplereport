const token =
  "eyJraWQiOiIwX0hWeTl2ZFd1bFZ6MFh1V0dUNmpCNDJib1d3ZWJXeFMwRS02OG9WVlpFIiwiYWxnIjoiUlMyNTYifQ.eyJ2ZXIiOjEsImp0aSI6IkFULl9YLWRGcGdzd05TZEhDQzVlQkdtQW45NGQxVXRhMlBwZm84TERpMWRKa2siLCJpc3MiOiJodHRwczovL2hocy1wcmltZS5va3RhcHJldmlldy5jb20vb2F1dGgyL2RlZmF1bHQiLCJhdWQiOiJhcGk6Ly9kZWZhdWx0IiwiaWF0IjoxNjM5MDg4MTI4LCJleHAiOjE2MzkwOTE3MjgsImNpZCI6IjBvYTFrMDE2M25Bd2ZWeE5XMWQ3IiwidWlkIjoiMDB1MWFvbG5heGlFcTJqS3kxZDciLCJzY3AiOlsic2ltcGxlX3JlcG9ydF9kZXYiLCJzaW1wbGVfcmVwb3J0Iiwib3BlbmlkIl0sInN1YiI6Im5jbHlkZUBza3lsaWdodC5kaWdpdGFsIiwiZGV2X3JvbGVzIjpbIlNSLURFVi1URU5BTlQ6Q08tRGV2LUNhbXAtZTYzYjc2ODUtMGNiZi00MDRiLWExMDYtYWQ1ZDcxMmVkYTdjOkZBQ0lMSVRZX0FDQ0VTUzoyOGFhYWM3Yi03MjI4LTRjZDgtOTRlYS03Mzg5ODBiYjcxMGIiLCJTUi1ERVYtVEVOQU5UOkNPLURldi1DYW1wLWU2M2I3Njg1LTBjYmYtNDA0Yi1hMTA2LWFkNWQ3MTJlZGE3YzpOT19BQ0NFU1MiLCJTUi1ERVYtVEVOQU5UOkNPLURldi1DYW1wLWU2M2I3Njg1LTBjYmYtNDA0Yi1hMTA2LWFkNWQ3MTJlZGE3YzpBRE1JTiIsIlNSLURFVi1URU5BTlQ6Q08tRGV2LUNhbXAtZTYzYjc2ODUtMGNiZi00MDRiLWExMDYtYWQ1ZDcxMmVkYTdjOkFMTF9GQUNJTElUSUVTIiwiU1ItREVWLVRFTkFOVDpDTy1EZXYtQ2FtcC1lNjNiNzY4NS0wY2JmLTQwNGItYTEwNi1hZDVkNzEyZWRhN2M6VVNFUiIsIlNSLURFVi1URU5BTlQ6Q08tRGV2LUNhbXAtZTYzYjc2ODUtMGNiZi00MDRiLWExMDYtYWQ1ZDcxMmVkYTdjOkVOVFJZX09OTFkiLCJTUi1ERVYtQURNSU5TIl0sImdpdmVuX25hbWUiOiJOaWNrIiwiZmFtaWx5X25hbWUiOiJDbHlkZSJ9.Tc5Zp8TIIeJQDnoiA0pY6VnUgoSraMH-4uWd8P4rveVZgnidXzYvanVTCRRybQrFQXcpbLj_mBai8kuWyye4tkgJj9WZ5MLaCKdVagFpR42XwfN5_1E1E_zxLpsqp_aX4LrYHVMzcgIqystKguioRcHwmeqSlDYYy9cXB-32i4XVTjULOwI1jnAF7CZmGK0hM9urY4bl2_L8wC639iWVK7qLJhHZg_ejaUL3KmgcHCS9glh8uCH8Bk-nahvtFJlxRIQmqSNM4L8HUiEFgKmRj2dTkhkMegemohDPseMayn5exptLRK2R3cqysjLUJcFhEAnB3315zOm7fybNMvjqIw";

// Since these tests interact with Okta, we need to use
// Wiremock to stub out the Okta API calls.
before(() => {
  cy.clearCookies();
  cy.task("downloadWiremock");
  cy.task("startWiremock", { stubDir: "orgSignUp" });
});
beforeEach(() => {
  // Cypress clears cookies by default, but for these tests
  // we want to preserve the Spring session cookie
  Cypress.Cookies.preserveOnce("SESSION");
  cy.setLocalStorage("access_token", token);
  cy.setLocalStorage("id_token", token);
});
after(() => {
  cy.clearCookies();
  cy.task("stopWiremock");
});

describe("Organization sign up", () => {
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
    cy.clearLocalStorage();
    cy.get("button.submit-button").click();
    cy.contains("Identity verification consent");
  });
  it("navigates to the support pending org table", () => {
    cy.getLocalStorage("access_token").should("equal", token);
    cy.visit("/admin/pending-organizations");
    cy.contains("Organizations Pending Identity Verification");
  });
  it("verifies the org", () => {
    cy.get('input[name="identity_verified"]+label').first().click();
    cy.contains("Save Changes").first().click();
    cy.contains("Identity verified for 1 organization", { timeout: 30000 });
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
