// Selector constants
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
    "What’s the first name of your best friend from high school?"
  );
  cy.get('input[name="answer"]').type("Jane Doe");
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
  cy.get('input[name="security-code"]').type(code);
  cy.get(submitButton).first().click();
});

describe("Okta account creation", () => {
  // Since these tests interact with Okta, we need to use
  // Wiremock to stub out the Okta API calls.
  before(() => {
    cy.clearCookies();
    cy.task("downloadWiremock");
    cy.restartWiremock("accountCreation");
  });
  beforeEach(() => {
    // Cypress clears cookies by default, but for these tests
    // we want to preserve the Spring session cookie
    Cypress.Cookies.preserveOnce("SESSION");
  });
  after(() => {
    cy.clearCookies();
    cy.task("stopWiremock");
  });
  describe("Account creation w/ SMS MFA", () => {
    it("navigates to the activation link", () => {
      cy.visit("/uac/?activationToken=h971awbXda7y7jGaxN8f");
      cy.contains("Create your password");
    });
    it("sets a password", () => {
      cy.setPassword();
    });
    it("sets a security question", () => {
      cy.setSecurityQuestion();
    });
    it("selects SMS MFA", () => {
      cy.mfaSelect("sms");
    });
    it("enters a phone number", () => {
      cy.enterPhoneNumber();
    });
    it("enters a verification code", () => {
      cy.verifySecurityCode("033457");
    });
    it("displays a success message", () => {
      cy.contains("Account set up complete");
    });
  });

  describe("Account creation w/ Okta Verify MFA", () => {
    before(() => {
      cy.restartWiremock("accountCreation");
    });
    it("navigates to the activation link", () => {
      cy.visit("/uac/?activationToken=NOr20VqF5M6m8AnwcSUJ");
      cy.contains("Create your password");
    });
    it("sets a password", () => {
      cy.setPassword();
    });
    it("sets a security question", () => {
      cy.setSecurityQuestion();
    });
    it("selects Okta Verify MFA", () => {
      cy.mfaSelect("okta");
    });
    it("'scans' a QR code", () => {
      cy.scanQrCode();
    });
    it("enters a verification code", () => {
      cy.verifySecurityCode("543663");
    });
    it("displays a success message", () => {
      cy.contains("Account set up complete");
    });
  });

  describe("Account creation w/ Google Authenticator MFA", () => {
    before(() => {
      cy.restartWiremock("accountCreation");
    });
    it("navigates to the activation link", () => {
      cy.visit("/uac/?activationToken=gqYPzH1FlPzVr0U3tQ7H");
      cy.contains("Create your password");
    });
    it("sets a password", () => {
      cy.setPassword();
    });
    it("sets a security question", () => {
      cy.setSecurityQuestion();
    });
    it("selects Google Authenticator MFA", () => {
      cy.mfaSelect("google");
    });
    it("'scans' a QR code", () => {
      cy.scanQrCode();
    });
    it("enters a verification code", () => {
      cy.verifySecurityCode("985721");
    });
    it("displays a success message", () => {
      cy.contains("Account set up complete");
    });
  });

  describe("Account creation w/ Voice Call MFA", () => {
    before(() => {
      cy.restartWiremock("accountCreation");
    });
    it("navigates to the activation link", () => {
      cy.visit("/uac/?activationToken=wN5mR-8SXao1TP2PLaFe");
      cy.contains("Create your password");
    });
    it("sets a password", () => {
      cy.setPassword();
    });
    it("sets a security question", () => {
      cy.setSecurityQuestion();
    });
    it("selects voice call MFA", () => {
      cy.mfaSelect("voice");
    });
    it("enters a phone number", () => {
      cy.enterPhoneNumber();
    });
    it("enters a verification code", () => {
      cy.verifySecurityCode("30835");
    });
    it("displays a success message", () => {
      cy.contains("Account set up complete");
    });
  });

  describe("Account creation w/ Email MFA", () => {
    before(() => {
      cy.restartWiremock("accountCreation");
    });
    it("navigates to the activation link", () => {
      cy.visit("/uac/?activationToken=4OVwdVhc6M1I-UwvLrNX");
      cy.contains("Create your password");
    });
    it("sets a password", () => {
      cy.setPassword();
    });
    it("sets a security question", () => {
      cy.setSecurityQuestion();
    });
    it("selects email MFA", () => {
      cy.mfaSelect("email");
    });
    it("enters a verification code", () => {
      cy.verifySecurityCode("007781");
    });
    it("displays a success message", () => {
      cy.contains("Account set up complete");
    });
  });
});
