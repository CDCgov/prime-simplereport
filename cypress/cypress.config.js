global.specRunVersions = new Map();

module.exports = {
  viewportWidth: 1200,
  viewportHeight: 800,
  defaultCommandTimeout: 10000,
  video: true,
  videoCompression: false,
  // retries: {
  //   runMode: 1,
  //   openMode: 1,
  // },
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
        setPatientName: (name) => {
          global.patientName = name;
          return null;
        },
        getPatientName() {
          return global.patientName;
        },
        setPatientDOB(dob) {
          global.patientDOB = dob;
          return null;
        },
        getPatientDOB() {
          return global.patientDOB;
        },
        setTestEventId(link) {
          global.testEventId = link;
          return null;
        },
        getTestEventId() {
          return global.testEventId;
        },
        setPatientPhone(phone) {
          global.patientPhone = phone;
          return null;
        },
        getPatientPhone() {
          return global.patientPhone;
        },
        setSpecRunVersionName(data) {
          global.specRunVersions.set(data.specRunName, data.versionName);
          return null;
        },
        getSpecRunVersionName(specRunName) {
          return global.specRunVersions.get(specRunName) || null;
        },
      });
      on("before:browser:launch", (browser = {}, launchOptions = {}) => {
        launchOptions.args = launchOptions.args.filter(
          (item) => item !== "--disable-dev-shm-usage",
        );
        if (browser.name === "chrome" && browser.isHeadless) {
          launchOptions.args.push("--window-size=1200,800");
          launchOptions.args.push("--force-device-scale-factor=1");
        }

        if (browser.name === "electron" && browser.isHeadless) {
          launchOptions.preferences.width = 1200;
          launchOptions.preferences.height = 1800;
        }

        if (browser.name === "firefox" && browser.isHeadless) {
          launchOptions.args.push("--width=1200");
          launchOptions.args.push("--height=800");
        }

        return launchOptions;
      });
    },
    baseUrl: "http://localhost.simplereport.gov",
  },
};
