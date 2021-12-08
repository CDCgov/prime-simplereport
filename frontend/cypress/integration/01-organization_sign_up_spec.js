const token =
  "eyJraWQiOiIwX0hWeTl2ZFd1bFZ6MFh1V0dUNmpCNDJib1d3ZWJXeFMwRS02OG9WVlpFIiwiYWxnIjoiUlMyNTYifQ.eyJ2ZXIiOjEsImp0aSI6IkFULjZGVjFsclp4NFRmODVrRXQtRmhvVUI0a1M4VlJ4enhlOVV2bkhBT25jWGsiLCJpc3MiOiJodHRwczovL2hocy1wcmltZS5va3RhcHJldmlldy5jb20vb2F1dGgyL2RlZmF1bHQiLCJhdWQiOiJhcGk6Ly9kZWZhdWx0IiwiaWF0IjoxNjM4OTk4ODA3LCJleHAiOjE2MzkwMDI0MDcsImNpZCI6IjBvYTFrMDE2M25Bd2ZWeE5XMWQ3IiwidWlkIjoiMDB1MWFvbG5heGlFcTJqS3kxZDciLCJzY3AiOlsib3BlbmlkIiwic2ltcGxlX3JlcG9ydF9kZXYiLCJzaW1wbGVfcmVwb3J0Il0sInN1YiI6Im5jbHlkZUBza3lsaWdodC5kaWdpdGFsIiwiZGV2X3JvbGVzIjpbIlNSLURFVi1URU5BTlQ6Q08tRGV2LUNhbXAtZTYzYjc2ODUtMGNiZi00MDRiLWExMDYtYWQ1ZDcxMmVkYTdjOkZBQ0lMSVRZX0FDQ0VTUzoyOGFhYWM3Yi03MjI4LTRjZDgtOTRlYS03Mzg5ODBiYjcxMGIiLCJTUi1ERVYtVEVOQU5UOkNPLURldi1DYW1wLWU2M2I3Njg1LTBjYmYtNDA0Yi1hMTA2LWFkNWQ3MTJlZGE3YzpOT19BQ0NFU1MiLCJTUi1ERVYtVEVOQU5UOkNPLURldi1DYW1wLWU2M2I3Njg1LTBjYmYtNDA0Yi1hMTA2LWFkNWQ3MTJlZGE3YzpBRE1JTiIsIlNSLURFVi1URU5BTlQ6Q08tRGV2LUNhbXAtZTYzYjc2ODUtMGNiZi00MDRiLWExMDYtYWQ1ZDcxMmVkYTdjOkFMTF9GQUNJTElUSUVTIiwiU1ItREVWLVRFTkFOVDpDTy1EZXYtQ2FtcC1lNjNiNzY4NS0wY2JmLTQwNGItYTEwNi1hZDVkNzEyZWRhN2M6VVNFUiIsIlNSLURFVi1URU5BTlQ6Q08tRGV2LUNhbXAtZTYzYjc2ODUtMGNiZi00MDRiLWExMDYtYWQ1ZDcxMmVkYTdjOkVOVFJZX09OTFkiLCJTUi1ERVYtQURNSU5TIl0sImdpdmVuX25hbWUiOiJOaWNrIiwiZmFtaWx5X25hbWUiOiJDbHlkZSJ9.j2bRVB599Mizg52xv2LHjiIEk_xa-Tm_D8kCZiRI-m6R6TDl8tM71j9yBDC6l4FGriYg9XymhfLgma9_9TIRDEX4uKbH8ZwH6TkKCHFTY9cEPj1iuhf7P_47EHiU2vFtPy3ZyaXxPF1wKEYptWJO0LD_bOkpyzoQ3jv2sqGnBUWrB4BSWvXtUb2jKVB7iSPjtiVIAPp1BnNPxfpPVyH8aZtHxhr0lH3PYG7-8qIslqeFF_WTampRUtWyhyuDUoCygIRDWdDcqL6gBBUPRyJUeyZVmubPAmDIcf37uf8HoogYUzuxtyOHT_tpHVRm5sJ1DIyidQ5UVx37pPnQ7pg1_g";

// Since these tests interact with Okta, we need to use
// Wiremock to stub out the Okta API calls.
before(() => {
  cy.clearCookies();
  //   cy.task("downloadWiremock");
  //   cy.task("startWiremock");
});
beforeEach(() => {
  // Cypress clears cookies by default, but for these tests
  // we want to preserve the Spring session cookie
  Cypress.Cookies.preserveOnce("SESSION");
  cy.setLocalStorage("access_token", token);
});
after(() => {
  cy.clearCookies();
  //   cy.task("stopWiremock");
});

describe("Organization sign up", () => {
  it.skip("navigates to the sign up form", () => {
    cy.visit("/sign-up");
    cy.contains("Sign up for SimpleReport");
    cy.contains("My organization is new to SimpleReport").click();
    cy.contains("Continue").click();
  });
  it.skip("fills out the org info form", () => {
    cy.contains("Sign up for SimpleReport in three steps");
    cy.get('input[name="name"]').type("Beach Camp");
    cy.get('select[name="state"]').select("CA");
    cy.get('select[name="type"]').select("Camp");
    cy.get('input[name="firstName"]').type("Greg");
    cy.get('input[name="lastName"]').type("McTester");
    cy.get('input[name="email"]').type("greg@mailinator.com");
    cy.get('input[name="workPhoneNumber"]').type("5308675309");
  });
  it.skip("submits successfully", () => {
    cy.clearLocalStorage();
    cy.get("button.submit-button").click();
    cy.contains("Identity verification consent");
  });
  it.skip("navigates to the support pending org table", () => {
    cy.getLocalStorage("access_token").should("equal", token);
    cy.visit("/admin/pending-organizations");
    cy.contains("Organizations Pending Identity Verification");
  });
  it.skip("verifies the org", () => {
    cy.get('input[name="identity_verified"]+label').first().click();
    cy.contains("Save Changes").first().click();
    cy.contains("Identity verified for 1 organization", { timeout: 30000 });
  });
  it.skip("spoofs into the org", () => {
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
  it.skip("spoofs into the org with the new facility", () => {
    cy.visit("/admin/tenant-data-access");
    cy.contains("Cancel access").click();
    cy.contains("Organization data").click();
    cy.get(".usa-card__container")
      .first()
      .within(() => {
        cy.get("select.usa-select").select("Beach Camp");
      });
    cy.get('input[name="justification"]').type("I am a test user");
    cy.contains("Access data").click();
  });
  it("enables adding patients", () => {
    cy.get("#patient-nav-link").click();
    cy.contains("No results");
  });
});
