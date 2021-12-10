/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

const { execSync, spawn } = require("child_process");

/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
module.exports = (on, _config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  on("task", {
    // These tasks set and read state to be passed between specs
    setAuth: ({ id_token, access_token }) => {
      global.auth = { id_token, access_token };
      return null;
    },
    getAuth: () => {
      return global.auth || {};
    },
    setPatientName: (name) => {
      global.patientName = name;
      return null;
    },
    getPatientName: () => {
      return global.patientName;
    },
    setPatientDOB: (dob) => {
      global.patientDOB = dob;
      return null;
    },
    getPatientDOB: () => {
      return global.patientDOB;
    },
    setPatientLink: (link) => {
      global.patientLink = link;
      return null;
    },
    getPatientLink: () => {
      return global.patientLink;
    },
    // These tasks are used to set up and run Wiremock
    downloadWiremock: () =>
      execSync("./cypress/support/wiremock/download-wiremock.sh"),
    startWiremock: ({ stubDir }) => {
      const wm = spawn("./cypress/support/wiremock/start-wiremock.sh", [
        stubDir,
      ]);
      execSync("./cypress/support/wiremock/ping-wiremock.sh");
      global.wm = wm;
      return null;
    },
    startOktaProxy: () => {
      const wm = spawn("./cypress/support/wiremock/start-okta-proxy.sh");
      execSync("./cypress/support/wiremock/ping-wiremock.sh");
      global.wm = wm;
      return null;
    },
    stopWiremock: () => {
      execSync("./cypress/support/wiremock/stop-wiremock.sh");
      if (global.wm) {
        global.wm.kill();
      }
      return null;
    },
  });
};
