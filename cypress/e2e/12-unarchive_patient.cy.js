const {graphqlURL} = require("../utils/request-utils");
const {aliasGraphqlOperations} = require("../utils/graphql-test-utils");
const {loginHooks} = require("../support/e2e");
const {whoAmI, getPatientWithLastNameByFacilityWithOrg, unarchivePatient} = require("../utils/testing-data-utils");

loginHooks();
describe("Unarchive patient",() => {
  let org, facility, patient, lastName;

  before(()=>{
    cy.task("getPatientName").then((name) => {
      let patientName = name;
      lastName = patientName.split(",")[0];
    });
    cy.intercept("POST", graphqlURL, (req) => {
      aliasGraphqlOperations(req);
    });
    whoAmI().then((res) => {
      org = res.body.data.whoami.organization;
      facility = res.body.data.whoami.organization.testingFacility[0];
      getPatientWithLastNameByFacilityWithOrg(facility.id, lastName, org.externalId).then((res) => {
        patient = res.body.data.patients[0];
        // unarchive patient in case it is archived because test re-ran
        unarchivePatient(patient.internalId, org.externalId);
      });
    })
  });

  it("displays unarchive patient page", () => {
    cy.visit("/patients");
    cy.get("#search-field-small").type(patient.lastName);
    cy.get(".sr-patient-list").contains(patient.lastName);
    cy.get(`#action_${patient.internalId}`).click();
    cy.contains("Archive patient").click();
    cy.contains("Yes, I'm sure").click();

    cy.visit("/admin/unarchive-patient");

    cy.get(".App").contains('Loading Organizations').should('not.exist');

    cy.injectSRAxe();
    cy.checkAccessibility();
    cy.get('select[name="organization"]').select(org.name);
    cy.get('select[name="facility"]').select(facility.name);
    cy.contains("Search").click();
    cy.get(".sr-patient-list").contains('Loading...').should('not.exist');
    cy.contains(patient.firstName).should('exist');
    cy.contains(patient.lastName).should('exist');
    cy.checkAccessibility();
    })
});
