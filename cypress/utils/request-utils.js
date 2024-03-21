export const frontendURL = `${
  Cypress.env("REACT_APP_BASE_URL") || "https://localhost.simplereport.gov/app"
}/`;
const backendURL = Cypress.env("BACKEND_URL") || "http://localhost:8080";
export const graphqlURL = `${backendURL}/graphql`;
export const addOrgToQueueURL = `${backendURL}/account-request/organization-add-to-queue`;
