// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

import "cypress-localstorage-commands";
import { authenticator } from "otplib";
import { addOrgToQueueURL, graphqlURL } from "../utils/request-utils";

// read environment variables

const username = Cypress.env("OKTA_USERNAME");
const password = Cypress.env("OKTA_PASSWORD");
const secret = Cypress.env("OKTA_SECRET");
const scope = Cypress.env("OKTA_SCOPE") || "simple_report_dev";
const clientId = Cypress.env("OKTA_CLIENT_ID") || "0oa1k0163nAwfVxNW1d7";
const redirectUri =
  Cypress.env("OKTA_REDIRECT_URI") ||
  "https%3A%2F%2Flocalhost.simplereport.gov%2F";
const isLocalRun = Cypress.env("IS_LOCAL_RUN") || false;

Cypress.Commands.add("login", () => {
  cy.task("getAuth").then(({ id_token, access_token }) => {
    if (id_token && access_token) {
      cy.log("Already logged in");
      cy.setLocalStorage("id_token", id_token);
      cy.setLocalStorage("access_token", access_token);
      cy.saveLocalStorage();
      return;
    } else {
      cy.session([username, password], () => {
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
            },
          ).then((response) => {
            const sessionToken = response.body.sessionToken;
            cy.request(
              "GET",
              `https://hhs-prime.oktapreview.com/oauth2/default/v1/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token%20id_token&scope=openid%20simple_report%20${scope}&nonce=thisisnotsafe&state=thisisbogus&sessionToken=${sessionToken}`,
            ).then((response) => {
              const redirect = response.redirects[0];
              const idTokenRegex = new RegExp(
                "(?:id_token=)((.[\\s\\S]*))(?:&access_token=)",
                "ig",
              );
              const accessTokenRegex = new RegExp(
                "(?:access_token=)((.[\\s\\S]*))(?:&token_type=Bearer)",
                "ig",
              );
              const id_token = idTokenRegex.exec(redirect)[1];
              const access_token = accessTokenRegex.exec(redirect)[1];
              cy.task("setAuth", { id_token, access_token });
              window.localStorage.setItem("id_token", id_token);
              window.localStorage.setItem("access_token", access_token);
            });
          });
        });
      });
    }
  });
});

Cypress.Commands.add("addDevice", (device) => {
  cy.get('input[name="name"]').type(device.name);
  cy.get('input[name="model"]').type(device.model);
  cy.get('input[name="manufacturer"]').type(device.manufacturer);
  cy.get('input[name="testLength"]').type("15");
  cy.get('input[role="combobox"]').first().type("Swab");
  cy.get('li[id="multi-select-swabTypes-list--option-1"]').click();
  cy.get('select[name="supportedDiseases.0.supportedDisease"').select(
    "COVID-19",
  );
  cy.get('input[name="supportedDiseases.0.testPerformedLoincCode"]').type(
    "123-456",
  );
  cy.get('input[name="supportedDiseases.0.testOrderedLoincCode"]').type(
    "9500-6",
  );
  if (device.isMultiplex) {
    cy.contains(".usa-button", "Add another disease").click();
    cy.get('select[name="supportedDiseases.1.supportedDisease"').select(
      "Flu A",
    );
    cy.get('input[name="supportedDiseases.1.testPerformedLoincCode"]').type(
      "456-789",
    );
    cy.get('input[name="supportedDiseases.1.testOrderedLoincCode"]').type(
      "9500-6",
    );
    cy.contains(".usa-button", "Add another disease").click();
    cy.get('select[name="supportedDiseases.2.supportedDisease"').select(
      "Flu B",
    );
    cy.get('input[name="supportedDiseases.2.testPerformedLoincCode"]').type(
      "789-123",
    );
    cy.get('input[name="supportedDiseases.2.testOrderedLoincCode"]').type(
      "9500-6",
    );
  }
  cy.contains("Save changes").should("be.enabled").click();
  cy.wait("@createDeviceType");
  cy.get(".Toastify").contains("Created Device");
});

Cypress.Commands.add("removeOrganizationAccess", () => {
  cy.visit("/admin/tenant-data-access");
  cy.contains("Cancel access").click();
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(5);
});

Cypress.Commands.add("resetWiremock", () => {
  return (
    !isLocalRun && cy.request("POST", "http://wiremock:8088/__admin/reset")
  );
});

Cypress.Commands.add("makePOSTRequest", (requestBody) => {
  return cy.getLocalStorage("access_token").then((token) =>
    cy.request({
      method: "POST",
      url: graphqlURL,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: requestBody,
    }),
  );
});

Cypress.Commands.add("addDevicesToCreatedFacility", (specName) => {
  return cy.getLocalStorage("access_token").then((token) => {});
});

Cypress.Commands.add("makeAccountRequest", (requestBody) => {
  cy.request({
    method: "POST",
    url: addOrgToQueueURL,
    headers: {
      "Content-Type": "application/json",
    },
    body: requestBody,
  });
});

Cypress.Commands.add("injectSRAxe", () => {
  return isLocalRun
    ? cy.injectAxe({
        axeCorePath: "./cypress/node_modules/axe-core/axe.min.js",
      })
    : cy.injectAxe();
});

// Print cypress-axe violations to the terminal
function printAccessibilityViolations(violations) {
  cy.task(
    "table",
    violations.map(({ id, impact, description, nodes }) => ({
      id,
      impact,
      description,
      "node count": nodes.length,
    })),
  );

  cy.task("print", "Nodes:");
  violations.forEach(({ nodes }) => {
    nodes.forEach((node) => {
      cy.task("print", node.html);
      cy.task("print", "=============\n");
    });
  });
}

Cypress.Commands.add("checkAccessibility", () => {
  cy.checkA11y(null, null, printAccessibilityViolations);
});
