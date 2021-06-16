/* eslint no-unused-expressions: 0 */
function enterInformation(browser) {
  this.expect
    .section("@enterInformation")
    .to.contain.text("Manage Organization");
  this.section.enterInformation.assert.attributeEquals(
    "@name",
    "disabled",
    "true"
  );
  this.section.enterInformation.click("@emptySelection");
  this.section.enterInformation.click("@save");
  this.expect
    .section("@toast")
    .to.contain.text("An organization type must be selected");
  browser.refresh();
  this.section.enterInformation.click("@nursingHome");
  this.section.enterInformation.click("@save");
  this.expect.section("@toast").to.contain.text("Updated Organization");
}

module.exports = {
  url: function () {
    return this.api.launchUrl + "/settings/organization";
  },
  commands: [{ enterInformation }],
  sections: {
    app: {
      selector: ".App",
    },
    enterInformation: {
      selector: ".prime-container",
      elements: {
        name: 'input[name="name"]',
        emptySelection: 'select[name="type"] option[value=""]',
        nursingHome: 'select[name="type"] option[value="nursing_home"]',
        save: "button",
      },
    },
    toast: {
      selector: ".Toastify",
    },
  },
};
