it("Checks if the frontend and backend are responding", () => {
  const commit_hash = Cypress.env("CHECK_COMMIT");
  const check_url = Cypress.env("CHECK_URL");
  cy.clearCookies();
  cy.clearLocalStorageSnapshot();
  cy.visit(check_url);
  cy.contains(commit_hash);
});
