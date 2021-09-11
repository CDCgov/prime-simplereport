/* eslint no-unused-expressions: 0 */

function createOrg() {
  this.expect.section("@app").to.be.visible;
  this.expect.section("@app").to.contain.text("Sign up for SimpleReport");
  this.expect
    .section("@app")
    .to.contain.text(
      "Each organization gets one account and just needs to sign up one time."
    );
  this.section.app.click("@continueButton");
  this.section.app.expect.element("@nameInput").to.be.visible;
  this.section.app.expect.element("@stateInput").to.be.visible;
  this.section.app.expect.element("@typeInput").to.be.visible;
  this.section.app.expect.element("@firstNameInput").to.be.visible;
  this.section.app.expect.element("@middleNameInput").to.be.visible;
  this.section.app.expect.element("@lastNameInput").to.be.visible;
  this.section.app.expect.element("@emailInput").to.be.visible;
  this.section.app.expect.element("@workPhoneNumberInput").to.be.visible;
  this.section.app.setValue("@nameInput", "Some Health Organizationzzzzz");
  this.section.app.click("@stateInput");
  this.section.app.click("@firstStateOption");
  this.section.app.click("@typeInput");
  this.section.app.click("@firstTypeOption");
  this.section.app.setValue("@firstNameInput", "Bobbo");
  this.section.app.setValue("@middleNameInput", "Greta");
  this.section.app.setValue("@lastNameInput", "McTester");
  this.section.app.setValue("@emailInput", "bobboz@test.com");
  this.section.app.setValue("@workPhoneNumberInput", "530-867-5309");
  this.section.app.click("@submitButton");
  this.expect.section("@app").not.to.contain.text("Sign up for SimpleReport");
  this.expect.section("@app").to.contain.text("Identity verification consent");
  return this;
}

module.exports = {
  url: function () {
    return this.api.launchUrl + "/sign-up";
  },
  commands: [
    {
      createOrg,
    },
  ],
  sections: {
    app: {
      selector: ".App",
      elements: {
        nameInput: 'input[name="name"]',
        stateInput: 'select[name="state"]',
        firstStateOption: 'select[name="state"] option[value="AL"]',
        typeInput: 'select[name="type"]',
        firstTypeOption: 'select[name="type"] option[value="airport"]',
        firstNameInput: 'input[name="firstName"]',
        middleNameInput: 'input[name="middleName"]',
        lastNameInput: 'input[name="lastName"]',
        emailInput: 'input[name="email"]',
        workPhoneNumberInput: 'input[name="workPhoneNumber"]',
        continueButton: "button.usa-button.continue-button",
        submitButton: "button.usa-button.submit-button",
      },
    },
  },
};
