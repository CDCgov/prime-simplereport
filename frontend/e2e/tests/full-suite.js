let patientName;

module.exports = {
  // '@disabled': true,
  '1. Add a patient': (browser) => {
    patientName = browser.page.patients().navigate().addPatient();
    console.info(`Adding patient ${patientName}...`);
  },
  '2. Conduct a test': (browser) => {
    console.info(`Conducting test for ${patientName}...`);
    browser.page.home().navigate().conductTest(patientName);
  },
};
