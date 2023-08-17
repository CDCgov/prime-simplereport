const {graphqlURL} = require("../utils/request-utils");
const {aliasGraphqlOperations} = require("../utils/graphql-test-utils");
const {loginHooks} = require("../support/e2e");

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
    cy.makePOSTRequest({
      operationName: "WhoAmI",
      variables: {},
      query: whoAmIQuery,
    }).then((res) => {
      org = res.body.data.whoami.organization;
      facility = res.body.data.whoami.organization.testingFacility[0];
      cy.makePOSTRequest({
        operationName: "GetPatientsByFacilityWithOrg",
        variables: {
          facilityId: facility.id,
          pageNumber: 0,
          pageSize: 1,
          archivedStatus: "ALL",
          namePrefixMatch: lastName,
          orgExternalId: org.externalId,
        },
        query: getPatientsByFacilityWithOrgQuery,
      }).then((res) => {
        patient = res.body.data.patients[0];
        // unarchive patient in case it is archived because test re-ran
        cy.makePOSTRequest({
          operationName: "ArchivePatient",
          variables: {
            patientId: patient.internalId,
            isDeleted: false,
            orgExternalId: org.externalId
          },
          query: archivePatientMutation,
        })
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

const getPatientsByFacilityWithOrgQuery = `query GetPatientsByFacilityWithOrg($facilityId: ID!, $pageNumber: Int!, $pageSize: Int!, $archivedStatus: ArchivedStatus, $namePrefixMatch: String, $orgExternalId: String) {
  patients(
      facilityId: $facilityId
      pageNumber: $pageNumber
      pageSize: $pageSize
      archivedStatus: $archivedStatus
      namePrefixMatch: $namePrefixMatch
      orgExternalId:$orgExternalId
      ) {
          internalId
          firstName
          lastName
          birthDate
         }
      }`

const archivePatientMutation= `mutation ArchivePatient($patientId: ID!, $isDeleted: Boolean! $orgExternalId: String) {
      setPatientIsDeleted(
      id: $patientId
      deleted: $isDeleted
      orgExternalId: $orgExternalId
      ) {
              id
        }
      }`

const whoAmIQuery = `
  query WhoAmI {
    whoami {
      organization {
        name
        externalId
        testingFacility {
          id
          name
        }
      }
    }
  }
`
