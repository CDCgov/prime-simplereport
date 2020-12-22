module.exports = {
  // '@disabled': true,
  '1. Navigate to homepage and add a patient': (browser) => {
    browser.page.homepage().navigate().addPatient();
  },
};
