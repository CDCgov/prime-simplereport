// Selector constants
import { loginHooks } from "../support/e2e";

const mfaRadios = {
  sms: 'input[value="SMS"]+label',
  okta: 'input[value="Okta"]+label',
  google: 'input[value="Google"]+label',
  securityKey: 'input[value="FIDO"]+label',
  voice: 'input[value="Phone"]+label',
  email: 'input[value="Email"]+label',
};
const submitButton = 'button[id="continue"]';

// Define custom commands for this suite
Cypress.Commands.add("setPassword", () => {
  const pass = "fooBAR123";
  cy.get('input[name="password"]').type(pass);
  cy.get('input[name="confirm-password"]').type(pass);
  cy.get(submitButton).click();
  cy.contains("Select your security question");
});

Cypress.Commands.add("setSecurityQuestion", () => {
  cy.get('select[name="security-question"]').select(
    "In what city or town was your first job?",
  );
  cy.get('input[name="answer"]').type("Omaha");
  cy.get(submitButton).click();
  cy.contains("Set up authentication");
});

Cypress.Commands.add("mfaSelect", (choice) => {
  Object.values(mfaRadios).forEach((radio) => {
    cy.get(radio).should("not.be.checked");
  });
  cy.get(mfaRadios[choice]).click();
  cy.get(submitButton).click();
});

Cypress.Commands.add("enterPhoneNumber", () => {
  cy.contains("Get your security code via");

  cy.get('input[name="phone-number"]').type("530867530");
  cy.contains("Get your security code via").click();
  cy.contains("Enter a valid phone number");
  cy.get('input[name="phone-number"]').type("9");
  cy.contains("Get your security code via").click();
  cy.get(submitButton).click();
});

Cypress.Commands.add("scanQrCode", () => {
  cy.contains("Get your security code via");

  cy.get(submitButton).click();
});

Cypress.Commands.add("verifySecurityCode", (code) => {
  cy.contains("Verify your security code.");
  cy.contains("One-time security code");

  cy.get('input[name="security-code"]').type(code);
  cy.get(submitButton).first().click();
});

describe("Checks each of the account creation MFA options", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.resetWiremock();

    cy.visit("/uac/?activationToken=NOr20VqF5M6m8AnwcSUJ");
    cy.contains("Create your password");
    cy.injectSRAxe();

    // activation page
    cy.checkAccessibility();

    cy.setPassword();
    // set password page
    cy.checkAccessibility();

    cy.setSecurityQuestion();
    // MFA page
    cy.checkAccessibility();
  });

  it("Account creation w/ SMS MFA", () => {
    cy.mfaSelect("sms");
    cy.enterPhoneNumber();
    cy.verifySecurityCode("033457");

    cy.contains("Account set up complete");
  });

  it("Account creation w/ Okta Verify MFA", () => {
    cy.mfaSelect("okta");
    cy.scanQrCode();
    cy.verifySecurityCode("543663");
    cy.contains("Account set up complete");
    cy.checkAccessibility();
  });
  it("Account creation w/ Google Aut`henticator MFA", () => {
    cy.mfaSelect("google");
    cy.scanQrCode();
    cy.verifySecurityCode("985721");

    cy.contains("Account set up complete");
    cy.checkAccessibility();
  });
  it("Account creation w/ Voice Call MFA", () => {
    cy.mfaSelect("voice");
    cy.enterPhoneNumber();
    cy.verifySecurityCode("30835");

    cy.contains("Account set up complete");
    cy.checkAccessibility();
  });
  it("Account creation w/ Email MFA", () => {
    cy.mfaSelect("email");

    cy.verifySecurityCode("007781");
    cy.contains("Account set up complete");
    cy.checkAccessibility();
  });
});
