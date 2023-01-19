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
import {authenticator} from "otplib";
import {graphqlURL} from "../utils/request-utils";

// read environment variables

const username = Cypress.env("OKTA_USERNAME");
const password = Cypress.env("OKTA_PASSWORD");
const secret = Cypress.env("OKTA_SECRET");
const scope = Cypress.env("OKTA_SCOPE") || "simple_report_dev";
const clientId = Cypress.env("OKTA_CLIENT_ID") || "0oa1k0163nAwfVxNW1d7";
const redirectUri = Cypress.env("OKTA_REDIRECT_URI") || "https%3A%2F%2Flocalhost.simplereport.gov%2F";

Cypress.Commands.add("login", () => {
  cy.task("getAuth").then(({ id_token, access_token }) => {
    if (id_token && access_token) {
      cy.log("Already logged in");
      cy.setLocalStorage("id_token", id_token);
      cy.setLocalStorage("access_token", access_token);
      cy.saveLocalStorage();
      return;
    } else {
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
            cy.saveLocalStorage();
          });
        });
      });
    }
  });
});

Cypress.Commands.add("restartWiremock", (stubDir) => {
  cy.clearCookies();
  cy.task("stopWiremock");
  cy.task("startWiremock", { stubDir });
});

Cypress.Commands.add("selectFacility", () => {
  cy.get("body").then(($body) => {
    if (
      $body
        .text()
        .includes(
          "Please select the testing facility where you are working today."
        )
    ) {
      cy.get(".usa-card__body").last().click();
    }
  });
});

Cypress.Commands.add("removeOrganizationAccess", () => {
  cy.visit("/admin/tenant-data-access");
  cy.contains("Cancel access").click();
  cy.wait(5);
});


Cypress.Commands.add("makePOSTRequest", (requestBody) => {
  return cy.getLocalStorage('access_token').then(token => (cy.request(
      {
        method: 'POST',
        url: graphqlURL,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: requestBody
      }
    ))
  )
})