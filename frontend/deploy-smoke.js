// Script that does a simple Selenium scrape of
// - A frontend page with a simple status message that hits a health check backend
// endpoint which does a simple ping to a non-sensitive DB table to verify
// all the connections are good.
// https://github.com/CDCgov/prime-simplereport/pull/7057

require("dotenv").config();
let { Builder } = require("selenium-webdriver");
const Chrome = require("selenium-webdriver/chrome");

console.log(`Running smoke test for ${process.env.REACT_APP_BASE_URL}`);
const options = new Chrome.Options();
const driver = new Builder()
  .forBrowser("chrome")
  .setChromeOptions(options.addArguments("--headless=new"))
  .build();
driver
  .navigate()
  .to(`${process.env.REACT_APP_BASE_URL}app/health/prod-smoke-test`)
  .then(() => {
    let value = driver.findElement({ id: "root" }).getText();
    return value;
  })
  .then((value) => {
    driver.quit();
    return value;
  })
  .then((value) => {
    if (value.includes("success")) process.exit(0);
    process.exit(1);
  });
