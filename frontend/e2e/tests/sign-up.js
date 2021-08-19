module.exports = {
  "1. Create an org": (browser) => {
    browser.page.signUp().navigate().createOrg();
  },
};
