export const graphqlURL = `${
  Cypress.env("BACKEND_URL") || "http://localhost:8080"
}/graphql`;

export const frontendURL = `${
  Cypress.env("FRONTEND_URL") || "http://localhost:3000"
}/`;
