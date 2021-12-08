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
  /* NOTE: DOB format is currently browser specific
       - Firefox does not support <input type='date' /> and takes the format accepted by the app
       - Chrome does support the date type and expects MM/DD/YYYY
  */
  return Cypress.browser.name === "chrome" ? "MM/DD/YYYY" : "YYYY-MM-DD";
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
