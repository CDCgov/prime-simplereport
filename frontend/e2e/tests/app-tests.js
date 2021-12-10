let patientName, birthMonth, birthDay, birthYear;

const getDobFormat = (browser) => {
  /* NOTE: DOB format is currently browser specific
       - Firefox does not support <input type='date' /> and takes the format accepted by the app
       - Chrome does support the date type and expects MM/DD/YYYY
  */
  return browser.capabilities.browserName === "chrome"
    ? "MM/DD/YYYY"
    : "YYYY-MM-DD";
};

module.exports = {
  "1. Add a patient": (browser) => {
    ({
      patientName,
      birthMonth,
      birthDay,
      birthYear,
    } = browser.page.patients().navigate().addPatient(getDobFormat(browser)));

    console.log("after adding patient, here is birthday info:");
    console.log("month: ", birthMonth);
    console.log("day: ", birthDay);
    console.log("year: ", birthYear);

    console.info(`Adding patient ${patientName}...`);
  },
  "2. Conduct a test": (browser) => {
    console.info(`Conducting test for ${patientName}...`);
    browser.page.home().navigate().conductTest(patientName);
  },
  "3. View the test result through patient experience": (browser) => {
    console.info(
      `Viewing test result through patient experience test for ${patientName}...`
    );
    const patientLinkPromise = browser.page
      .home()
      .navigate()
      .getResultPatientLink(patientName);

    patientLinkPromise.then((patientLink) => {
      browser.page
        .patientExperience()
        .navigate(patientLink)
        .acceptTos()
        .verifyBirthDate(birthMonth, birthDay, birthYear)
        .viewTestResult();
    });
  },
  "4. Self registration through a registration link": (browser) => {
    console.info(`Registering a patient through a self-registration link`);
    browser.page
      .selfRegistration()
      .navigate()
      .acceptTos()
      .enterInformation(getDobFormat(browser));
  },
  "5. Update organization settings": (browser) => {
    console.info("Updating organization settings");
    browser.page.settings().navigate().enterInformation(browser);
  },
};
