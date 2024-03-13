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
import "cypress-axe";

const { faker } = require("@faker-js/faker");
const dayjs = require("dayjs");

export const testNumber = () => {
  return Math.round(Date.now() / 1000);
};

const getDobFormat = () => {
  return "YYYY-MM-DD";
};

// Generate a random patient
export const generatePatient = () => {
  const patient = {};
  patient.firstName = faker.person.firstName();
  patient.lastName = faker.person.lastName();
  patient.fullName = `${patient.lastName}, ${patient.firstName}`;
  patient.dob = dayjs(
    faker.date.between({ from: "1920-01-01", to: "2002-12-31" }),
  );
  patient.dobForInput = patient.dob.format(getDobFormat());
  patient.dobForPatientLink = patient.dob.format("MM/DD/YYYY");
  patient.phone = "(800) 232-4636";
  patient.address = "736 Jackson PI NW";
  patient.city = "Definitely not Washington";
  patient.state = "DC";
  patient.zip = "20503";
  patient.studentId = faker.string.uuid();
  return patient;
};

export const generateFacility = () => {
  const facility = {};
  facility.name = `${testNumber()}-${faker.company.name()}`;
  return facility;
};

export const generateOrganization = () => {
  const organization = {};
  organization.name = `${testNumber()}-${faker.company.name()}`;
  return organization;
};

export const generateMultiplexDevice = () => {
  const multiplexDevice = {};
  multiplexDevice.name = `multiplex-${testNumber()}-${faker.company.name()}-device`;
  multiplexDevice.model = `multiplex-${testNumber()}-${faker.company.name()}-model`;
  multiplexDevice.manufacturer = `${testNumber()}-${faker.company.name()}`;
  multiplexDevice.isMultiplex = true;
  return multiplexDevice;
};

export const generateCovidOnlyDevice = () => {
  const covidOnlyDevice = {};
  covidOnlyDevice.name = `covid-${testNumber()}-${faker.company.name()}-device`;
  covidOnlyDevice.model = `covid-${testNumber()}-${faker.company.name()}-model`;
  covidOnlyDevice.manufacturer = `${testNumber()}-${faker.company.name()}`;
  covidOnlyDevice.isMultiplex = false;
  return covidOnlyDevice;
};

export const generateUser = () => {
  const user = {};
  user.email = `${testNumber()}-${faker.internet.email()}`;
  return user;
};

// Don't fail tests on redirect to Okta for login
Cypress.on("uncaught:exception", (err, _runnable) => {
  if (err.message.includes("Not authenticated, redirecting to Okta...")) {
    return false;
  }
});

// go back and add some programmatic id's possibly?
// https://docs.cypress.io/api/commands/session#Choosing-the-correct-id-to-cache-a-session
export const loginHooks = () => {
  cy.session("SESSION", cy.login, { cacheAcrossSpecs: true });
};
