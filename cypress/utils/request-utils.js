export const graphqlURL = `${
  Cypress.env("BACKEND_URL") || "http://localhost:8080"
}/graphql`;

export const frontendURL = `${
  Cypress.env("REACT_APP_BASE_URL") || "http://localhost:3000"
}/`;
