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
      "Enter your date of birth to access your COVID-19 testing portal."
    );
  this.section.app.expect.element("@monthInput").to.be.visible;
  this.section.app.setValue("@monthInput", birthDate.month);
  this.section.app.expect.element("@dayInput").to.be.visible;
  this.section.app.setValue("@dayInput", birthDate.day);
  this.section.app.expect.element("@yearInput").to.be.visible;
  this.section.app.setValue("@yearInput", birthDate.year);
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
        monthInput: "input[name=birthMonth]",
        dayInput: "input[name=birthDay]",
        yearInput: "input[name=birthYear]",
        dobSubmitButton: "#dob-submit-button",
      },
    },
  },
};
