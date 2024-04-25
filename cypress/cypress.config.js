global.specRunVersions = new Map();
const { defineConfig } = require("cypress");

module.exports = defineConfig({
  viewportWidth: 1200,
  viewportHeight: 800,
  defaultCommandTimeout: 10000,
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
    },
    baseUrl: "http://localhost.simplereport.gov",
  },
});
