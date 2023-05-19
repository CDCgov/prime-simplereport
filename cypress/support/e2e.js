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
import 'cypress-axe';
import {authenticator} from "otplib";

// Alternatively you can use CommonJS syntax:
// require('./commands')

const faker = require("faker");
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
  patient.firstName = faker.name.firstName();
  patient.lastName = faker.name.lastName();
  patient.fullName = `${patient.lastName}, ${patient.firstName}`;
  patient.dob = dayjs(faker.date.between("1920-01-01", "2002-12-31"));
  patient.dobForInput = patient.dob.format(getDobFormat());
  patient.dobForPatientLink = patient.dob.format("MM/DD/YYYY");
  patient.phone = "(800) 232-4636";
  patient.address = "736 Jackson PI NW";
  patient.city = "Definitely not Washington";
  patient.state = "DC";
  patient.zip = "20503";
  patient.studentId = faker.datatype.uuid();
  return patient;
};

export const generateFacility = () => {
  const facility = {};
  facility.name = `${testNumber()}-${faker.company.companyName()}`;
  return facility;
};

export const generateOrganization = () => {
  const organization = {};
  organization.name = `${testNumber()}-${faker.company.companyName()}`;
  return organization;
};

export const generateMultiplexDevice = () => {
  const multiplexDevice = {};
  multiplexDevice.name = `${testNumber()}-${faker.company.companyName()}-multiplex-device`;
  multiplexDevice.model = `${testNumber()}-${faker.company.companyName()}-multiplex-model`;
  multiplexDevice.manufacturer = `${testNumber()}-${faker.company.companyName()}`;
  multiplexDevice.isMultiplex = true;
  return multiplexDevice;
}

export const generateCovidOnlyDevice = () => {
  const covidOnlyDevice = {};
  covidOnlyDevice.name = `${testNumber()}-${faker.company.companyName()}-covid-device`;
  covidOnlyDevice.model = `${testNumber()}-${faker.company.companyName()}-covid-model`;
  covidOnlyDevice.manufacturer = `${testNumber()}-${faker.company.companyName()}`;
  covidOnlyDevice.isMultiplex = false
  return covidOnlyDevice;
}

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

export const loginWithSession =  ()=>{
  const username = Cypress.env("OKTA_USERNAME");
  const password = Cypress.env("OKTA_PASSWORD");



  cy.session(
    [username, password],
    () => {
      if(!Cypress.env("SKIP_OKTA")){

        return;
      }

      cy.request("POST", "https://hhs-prime.oktapreview.com/api/v1/authn", {
        username,
        password,
        options: {
          multiOptionalFactorEnroll: true,
          warnBeforePasswordExpired: true,
        },
      }).then((response) => {
        const stateToken = response.body.stateToken;
        const factorId = response.body._embedded.factors[0].id;
        const passCode = authenticator.generate(secret);
        cy.request(
          "POST",
          `https://hhs-prime.oktapreview.com/api/v1/authn/factors/${factorId}/verify`,
          {
            passCode,
            stateToken,
          }
        ).then((response) => {
          const sessionToken = response.body.sessionToken;
          cy.request(
            "GET",
            `https://hhs-prime.oktapreview.com/oauth2/default/v1/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token%20id_token&scope=openid%20simple_report%20${scope}&nonce=thisisnotsafe&state=thisisbogus&sessionToken=${sessionToken}`
          ).then((response) => {
            const redirect = response.redirects[0];
            const idTokenRegex = new RegExp(
              "(?:id_token=)((.[\\s\\S]*))(?:&access_token=)",
              "ig"
            );
            const accessTokenRegex = new RegExp(
              "(?:access_token=)((.[\\s\\S]*))(?:&token_type=Bearer)",
              "ig"
            );
            const id_token = idTokenRegex.exec(redirect)[1];
            const access_token = accessTokenRegex.exec(redirect)[1];
            cy.task("setAuth", { id_token, access_token });
            cy.setLocalStorage("id_token", id_token);
            cy.setLocalStorage("access_token", access_token);
            //cy.saveLocalStorage();
          });
        });
      });
    },
    {
      validate() {
        if(!cy.getLocalStorage('access_token')|| cy.getLocalStorage('token_id')){
          throw "Unauthenticated";
        }
      }
    }
  )
}
