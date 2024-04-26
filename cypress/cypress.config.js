global.specRunVersions = new Map();
const { defineConfig } = require("cypress");
const fs = require("fs");

module.exports = defineConfig({
  viewportWidth: 1200,
  viewportHeight: 800,
  defaultCommandTimeout: 10000,
  video: true,
  videoCompression: false,
  retries: {
    runMode: 1,
    openMode: 1,
  },
  e2e: {
    supportFile: "cypress/support/e2e.js",
    setupNodeEvents(on, config) {
      on("task", {
        // These tasks set and read state to be passed between specs
        setAuth({ id_token, access_token }) {
          global.auth = { id_token, access_token };
          return null;
        },
        getAuth() {
          return global.auth || {};
        },
        table(message) {
          console.table(message);
          return null;
        },
        print(message) {
          console.log(message);
          return null;
        },
        setSpecRunVersionName(data) {
          global.specRunVersions.set(data.specRunName, data.versionName);
          return null;
        },
        getSpecRunVersionName(specRunName) {
          return global.specRunVersions.get(specRunName) || null;
        },
      });
      on("after:spec", (spec, results) => {
        if (results && results.video) {
          // Do we have failures for any retry attempts?
          const failures = results.tests.some((test) =>
            test.attempts.some((attempt) => attempt.state === "failed"),
          );
          if (!failures) {
            // delete the video if the spec passed and no tests retried
            fs.unlinkSync(results.video);
          }
        }
      });
    },
    baseUrl: "http://localhost.simplereport.gov",
  },
});
