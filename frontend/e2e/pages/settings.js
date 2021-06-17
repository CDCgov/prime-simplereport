/* eslint no-unused-expressions: 0 */
function enterInformation() {
  this.expect
    .section("@enterInformation")
    .to.contain.text("Manage Organization");
  this.section.enterInformation.expect.element("@name").to.be.not.present;
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
      },
    },
  },
};
