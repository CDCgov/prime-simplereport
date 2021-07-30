/* eslint no-unused-expressions: 0 */

function setPassword() {
  const pass = "fooBAR123";
  this.expect.section("@app").to.be.visible;
  this.expect.section("@app").to.contain.text("Create your password");
  this.section.app.expect.element("@passInput").to.be.visible;
  this.section.app.expect.element("@passConfInput").to.be.visible;
  this.section.app.expect.element("@submitButton").to.be.visible;
  this.section.app.setValue("@passInput", pass);
  this.section.app.setValue("@passConfInput", pass);
  this.section.app.click("@submitButton");
  this.expect.section("@app").not.to.contain.text("Create your password");
  return this;
}

function setSecurityQuestion() {
  this.expect.section("@app").to.be.visible;
  this.expect.section("@app").to.contain.text("Select your security question");
  this.section.app.expect.element("@securityQuestionInput").to.be.visible;
  this.section.app.expect.element("@securityAnswerInput").to.be.visible;
  this.section.app.expect.element("@submitButton").to.be.visible;
  this.section.app.setValue(
    "@securityQuestionInput",
    "What’s the first name of your best friend from high school?"
  );
  this.section.app.setValue("@securityAnswerInput", "Jane Doe");
  this.section.app.click("@submitButton");
  this.expect
    .section("@app")
    .not.to.contain.text("Select your security question");
  return this;
}

function mfaSelect(choice) {
  this.expect.section("@app").to.be.visible;
  this.expect.section("@app").to.contain.text("Set up authentication");
  this.section.app.expect.element("@smsMfaRadio").to.be.visible;
  this.section.app.expect.element("@oktaMfaRadio").to.be.visible;
  this.section.app.expect.element("@googleMfaRadio").to.be.visible;
  this.section.app.expect.element("@securityKeyMfaRadio").to.be.visible;
  this.section.app.expect.element("@voiceMfaRadio").to.be.visible;
  this.section.app.expect.element("@emailMfaRadio").to.be.visible;

  this.section.app.click(choice);
  this.section.app.click("@submitButton");
  return this;
}

function enterPhoneNumber() {
  this.expect.section("@app").to.be.visible;
  this.expect.section("@app").to.contain.text("Get your security code via");
  this.section.app.expect.element("@phoneInput").to.be.visible;
  this.section.app.setValue("@phoneInput", "5308675309");
  this.section.app.click("@submitButton");
  return this;
}

function scanQrCode() {
  this.expect.section("@app").to.be.visible;
  this.expect.section("@app").to.contain.text("Get your security code via");
  this.section.app.click("@submitButton");
  return this;
}

function verifySecurityCode(code) {
  this.expect.section("@app").to.be.visible;
  this.expect.section("@app").to.contain.text("Verify your security code.");
  this.section.app.expect.element("@securityCodeInput").to.be.visible;
  this.section.app.setValue("@securityCodeInput", code);
  this.section.app.click("@submitButton");
  return this;
}

function success() {
  this.expect.section("@app").to.be.visible;
  this.expect.section("@app").to.contain.text("Account set up complete");
  return this;
}

module.exports = {
  url: (url) => url,
  commands: [
    {
      setPassword,
      setSecurityQuestion,
      mfaSelect,
      enterPhoneNumber,
      scanQrCode,
      verifySecurityCode,
      success,
    },
  ],
  sections: {
    app: {
      selector: ".App",
      elements: {
        passInput: 'input[name="password"]',
        passConfInput: 'input[name="confirm-password"]',
        submitButton: "button.usa-button",
        securityQuestionInput: 'select[name="security-question"]',
        securityAnswerInput: 'input[name="answer"]',
        smsMfaRadio: 'input[value="SMS"]+label',
        oktaMfaRadio: 'input[value="Okta"]+label',
        googleMfaRadio: 'input[value="Google"]+label',
        securityKeyMfaRadio: 'input[value="FIDO"]+label',
        voiceMfaRadio: 'input[value="Phone"]+label',
        emailMfaRadio: 'input[value="Email"]+label',
        phoneInput: 'input[name="phone-number"]',
        securityCodeInput: 'input[name="security-code"]',
      },
    },
  },
};
