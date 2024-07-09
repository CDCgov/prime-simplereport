// Script that does a simple Selenium scrape of
// - A frontend page with a simple status message that hits a health check backend
// endpoint which does a simple ping to a non-sensitive DB table to verify
// all the connections are good.
// https://github.com/CDCgov/prime-simplereport/pull/7057
require("dotenv").config();
let { Builder } = require("selenium-webdriver");
const Chrome = require("selenium-webdriver/chrome");

const appUrl = process.env.REACT_APP_BASE_URL.includes("localhost")
  ? `${process.env.REACT_APP_BASE_URL}/health/deploy-smoke-test`
  : `https://${process.env.REACT_APP_BASE_URL}/app/health/deploy-smoke-test`;

console.log(`Running smoke test for ${appUrl}`);
const options = new Chrome.Options();
const driver = new Builder()
  .forBrowser("chrome")
  .setChromeOptions(options.addArguments("--headless=new"))
  .build();

const TIMEOUT_DURATION_MS = 10 * 1000;

driver
  .navigate()
  .to(`${appUrl}`)
  .then(async () => {
    await driver.sleep(TIMEOUT_DURATION_MS);
    return driver.findElement({ id: "root" }).getText();
  })
  .then((value) => {
    driver.quit();
    return value;
  })
  .then((value) => {
    let appStatusSuccess, oktaStatusSuccess;
    if (value.includes("App status returned success")) {
      appStatusSuccess = true;
    }
    if (value.includes("Okta status returned success")) {
      oktaStatusSuccess = true;
    }
    if (value.includes("App status returned failure")) {
      appStatusSuccess = false;
    }
    if (value.includes("Okta status returned failure")) {
      oktaStatusSuccess = false;
    }

    if (appStatusSuccess && oktaStatusSuccess) {
      console.log(`Smoke test returned success status for ${appUrl}`);
      process.exitCode = 0;
      return;
    }

    if (appStatusSuccess === false || oktaStatusSuccess === false) {
      console.log(`Smoke test returned failure status for ${appUrl}`);
      console.log(
        `App health returned ${appStatusSuccess}, okta health returned ${oktaStatusSuccess}`
      );
      process.exitCode = 1;
      return;
    }

    console.log("Smoke test encountered unknown failure.");
    console.log(`Root element value was: ${value}`);
    process.exitCode = 1;
  });
