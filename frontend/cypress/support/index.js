// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";

// Alternatively you can use CommonJS syntax:
// require('./commands')

const faker = require("faker");
const dayjs = require("dayjs");

const getDobFormat = () => {
  return "YYYY-MM-DD";
};

// Generate a random patient
export const generatePatient = () => {
  const patient = {};
  patient.firstName = faker.name.firstName();
  patient.lastName = faker.name.lastName();
  patient.fullName = `${patient.lastName}, ${patient.firstName}`;
  patient.dob = dayjs(faker.date.between("1920-01-01", "2002-12-31"));
  patient.dobForInput = patient.dob.format(getDobFormat());
  patient.dobForPatientLink = patient.dob.format("MM/DD/YYYY");
  patient.phone = "(800) 232-4636";
  patient.address = "736 Jackson PI NW";
  patient.state = "DC";
  patient.zip = "20503";
  patient.studentId = faker.datatype.uuid();
  return patient;
};

// Don't fail tests on redirect to Okta for login
Cypress.on("uncaught:exception", (err, _runnable) => {
  if (err.message.includes("Not authenticated, redirecting to Okta...")) {
    return false;
  }
});

export const loginHooks = () => {
  // Global before for logging in to Okta
  before(() => {
    // Clear any leftover data from previous tests
    cy.clearCookies();
    cy.clearLocalStorageSnapshot();
    // Login to Okta to get an access token
    !Cypress.env("SKIP_OKTA") && cy.login();
  });
  beforeEach(() => {
    // Cypress clears cookies by default, but for these tests
    // we want to preserve the Spring session cookie
    Cypress.Cookies.preserveOnce("SESSION");
    // It also clears local storage, so restore before each test
    cy.restoreLocalStorage();
  });
  afterEach(() => {
    cy.saveLocalStorage();
  });
};
