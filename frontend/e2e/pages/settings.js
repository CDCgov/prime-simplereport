/* eslint no-unused-expressions: 0 */
function enterInformation() {
  this.expect
    .section("@enterInformation")
    .to.contain.text("Manage Organization");
  this.section.enterInformation.assert.attributeEquals(
    "@name",
    "disabled",
    "true"
  );
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
