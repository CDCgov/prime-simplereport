/* eslint no-unused-expressions: 0 */

function acceptTos() {
  this.expect.section("@app").to.be.visible;
  this.expect.section("@app").to.contain.text("I agree");
  this.section.app.expect.element("@tosConsentButton").to.be.visible;
  this.section.app.click("@tosConsentButton");
  return this;
}

function verifyBirthDate(birthDate) {
  this.expect.section("@app").to.be.visible;
  this.expect
    .section("@app")
    .to.contain.text(
      "Enter your date of birth to access your COVID-19 Testing Portal."
    );
  this.section.app.expect.element("@dobInput").to.be.visible;
  this.section.app.setValue("@dobInput", birthDate);
  this.section.app.click("@dobSubmitButton");
  this.expect.section("@app").to.be.visible;
  return this;
}

function viewTestResult() {
  this.expect.section("@app").to.be.visible;
  this.expect.section("@app").to.contain.text("SARS-CoV-2 result");
  this.expect.section("@app").to.contain.text("Test result");
  this.expect.section("@app").to.contain.text("Test date");
  this.expect.section("@app").to.contain.text("Test device");
}

module.exports = {
  url: (url) => url,
  commands: [
    {
      acceptTos,
      verifyBirthDate,
      viewTestResult,
    },
  ],
  sections: {
    app: {
      selector: ".App",
      elements: {
        tosConsentButton: "#tos-consent-button",
        dobInput: 'input[name="birthDate"]',
        dobSubmitButton: "#dob-submit-button",
      },
    },
  },
};
