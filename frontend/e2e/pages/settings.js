/* eslint no-unused-expressions: 0 */
function enterInformation(browser) {
  this.expect
    .section("@enterInformation")
    .to.contain.text("Manage organization");
  this.section.enterInformation.expect.element("@name").not.to.be.present;
  this.section.enterInformation.click("@emptySelection");
  this.section.enterInformation.click("@save");
  this.expect
    .section("@toast")
    .to.contain.text("An organization type must be selected");
  browser.refresh();
  this.section.enterInformation.click("@nursingHome");
  this.section.enterInformation.click("@save");
  this.expect.section("@toast").to.contain.text("Updated organization");
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
