import { loginHooks } from "../support";

describe("Updating organization settings", () => {
  loginHooks();
  it("navigates to the org settings page", () => {
    cy.visit("/settings/organization");
    cy.get(".prime-container").contains("Manage organization");

    // failing a11y test
    // Test a11y on the Manage organization page
    cy.injectAxe();
    cy.checkA11y(
        {
          exclude: [],
        },
        {
          rules: {
            'page-has-heading-one': { enabled: false },
          },
        },
    );
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
