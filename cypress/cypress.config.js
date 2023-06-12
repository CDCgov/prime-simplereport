const {execSync, spawn} = require("child_process");
const path = require("path");

const isLocalRun = process.env["CYPRESS_IS_LOCAL_RUN"] || false;

function getWiremockPath(filename) {
  let wiremockPath = isLocalRun ?
    "support/wiremock" : "cypress/support/wiremock";
  return `${wiremockPath}/${filename}`;
}
module.exports = {
  viewportWidth: 1200,
  viewportHeight: 800,
  defaultCommandTimeout: 10000,
  video: true,
  videoUploadOnPasses: false,
  videoCompression: false,
  retries: {
    runMode: 1,
    openMode: 1,
  },
  e2e: {
    supportFile: 'cypress/support/e2e.js',
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
        setPatientLink(link) {
          global.patientLink = link;
          return null;
        },
        getPatientLink() {
          return global.patientLink;
        },
        setPatientPhone(phone) {
          global.patientPhone = phone;
          return null;
        },
        getPatientPhone() {
          return global.patientPhone;
        },
        setCovidOnlyDeviceName(name) {
          global.covidOnlyDeviceName = name;
          return null;
        },
        getCovidOnlyDeviceName() {
          return global.covidOnlyDeviceName;
        },
        setMultiplexDeviceName(name) {
          global.multiplexDeviceName = name;
          return null;
        },
        getMultiplexDeviceName() {
          return global.multiplexDeviceName;
        },
        // These tasks are used to set up and run Wiremock
        downloadWiremock() {
          execSync(
            path.resolve(__dirname, getWiremockPath('download-wiremock.sh'))
          )
          return null;
        },
        startWiremock({ stubDir }) {
          const wm = spawn(
            path.resolve(__dirname, getWiremockPath('start-wiremock.sh')),
            [stubDir]
          );
          execSync(
            path.resolve(__dirname, getWiremockPath('ping-wiremock.sh')),
          );
          global.wm = wm;
          return null;
        },
        startOktaProxy() {
          const wm = spawn(
            path.resolve(__dirname, getWiremockPath('start-wiremock.sh')),
          );
          execSync(
            path.resolve(__dirname, getWiremockPath('ping-wiremock.sh')),
          );
          global.wm = wm;
          return null;
        },
        stopWiremock() {
          execSync(
            path.resolve(__dirname, getWiremockPath('stop-wiremock.sh')),
          );
          if (global.wm) {
            global.wm.kill();
          }
          return null;
        }
      })
      on("before:browser:launch", (browser = {}, launchOptions = {}) => {
        launchOptions.args = launchOptions.args.filter(
          (item) => item !== "--disable-dev-shm-usage"
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
    baseUrl: 'http://localhost.simplereport.gov',
  },
}
