// QUERIES
export const whoAmI = () => {
  return cy.makePOSTRequest({
    operationName: "WhoAmI",
    variables: {},
    query: `query WhoAmI {
      whoami {
        organization {
          id
          facilities {
            id
          }
        }
      }
    }`,
  });
};
export const getOrganizationById = (organizationId) => {
  return cy.makePOSTRequest({
    operationName: "Organization",
    variables: { id: organizationId },
    query: `query Organization($id: ID!) {
      organization(id: $id) {
        id
        name
      }
    }`,
  });
};
export const getOrganizationsByName = (organizationName, isDeleted = false) => {
  return cy.makePOSTRequest({
    operationName: "OrganizationsByName",
    variables: { name: organizationName, isDeleted: isDeleted },
    query: `query OrganizationsByName($name: String! $isDeleted: Boolean) {
      organizationsByName(name: $name, isDeleted: $isDeleted) {
        id
        name
        externalId
        facilities {
          id
          name
          isDeleted
        }
      }
    }`,
  });
};
export const getPatientsByFacilityId = (facilityId) => {
  return cy.makePOSTRequest({
    operationName: "Patients",
    variables: { facilityId: facilityId },
    query: `query Patients($facilityId: ID!) {
           patients(facilityId: $facilityId){
            internalId
           }
        }`,
  });
};
export const getPatientLinkByTestEventId = (testEventId) => {
  return cy.makePOSTRequest({
    operationName: "TestResult",
    variables: { id: testEventId },
    query: `query TestResult($id: ID!) {
           testResult(id: $id){
            patientLink {
              internalId
            }
          }
        }`,
  });
};
// MUTATIONS
export const verifyPendingOrganization = (orgExternalId) => {
  return cy.makePOSTRequest({
    operationName: "VerifyPendingOrganization",
    variables: {
      externalId: orgExternalId,
    },
    query: `mutation VerifyPendingOrganization(
      $externalId: String!
    ) {
      setOrganizationIdentityVerified(
        externalId: $externalId,
        verified: true
      )
    }`,
  });
};
export const accessOrganization = (orgExternalId) => {
  return cy.makePOSTRequest({
    operationName: "SetCurrentUserTenantDataAccess",
    variables: {
      organizationExternalId: orgExternalId,
    },
    query: `mutation SetCurrentUserTenantDataAccess(
      $organizationExternalId: String!
    ) {
      setCurrentUserTenantDataAccess(
        organizationExternalId: $organizationExternalId,
        justification: "cypress testing"
      ) {
        id
        organization {
          externalId
          facilities {
            id
            name
          }
        }
      }
    }`,
  });
};
export const addMockFacility = (facilityName) => {
  return cy.makePOSTRequest({
    operationName: "AddFacility",
    variables: {
      testingFacilityName: facilityName,
      street: "123 maint street",
      state: "NJ",
      zipCode: "07601",
      phone: "8002324636",
      cliaNumber: "12D4567890",
      orderingProviderFirstName: "Jane",
      orderingProviderLastName: "Austen",
      orderingProviderNPI: "1234567890",
      orderingProviderStreet: "",
      orderingProviderStreetTwo: "",
      orderingProviderCity: "",
      orderingProviderState: "",
      orderingProviderZipCode: "",
      orderingProviderPhone: "7328392412",
      devices: [],
    },
    query: `mutation AddFacility(
  $testingFacilityName: String!
  $street: String!
  $state: String!
  $zipCode: String!
  $phone: String
  $cliaNumber: String
  $orderingProviderFirstName: String
  $orderingProviderMiddleName: String
  $orderingProviderLastName: String
  $orderingProviderSuffix: String
  $orderingProviderNPI: String
  $orderingProviderStreet: String
  $orderingProviderStreetTwo: String
  $orderingProviderCity: String
  $orderingProviderState: String
  $orderingProviderZipCode: String
  $orderingProviderPhone: String
  $devices: [ID]!
) {
  addFacility(
    facilityInfo: {
      facilityName: $testingFacilityName
      address: {
        street: $street
        state: $state
        zipCode: $zipCode
      }
      phone: $phone
      cliaNumber: $cliaNumber
      orderingProvider: {
        firstName: $orderingProviderFirstName
        middleName: $orderingProviderMiddleName
        lastName: $orderingProviderLastName
        suffix: $orderingProviderSuffix
        npi: $orderingProviderNPI
        street: $orderingProviderStreet
        streetTwo: $orderingProviderStreetTwo
        city: $orderingProviderCity
        state: $orderingProviderState
        zipCode: $orderingProviderZipCode
        phone: $orderingProviderPhone
      }
      deviceIds: $devices
    }
  ) {
    id
  }
}`,
  });
};
export const markOrganizationAsDeleted = (orgId, deleted) => {
  return cy.makePOSTRequest({
    operationName: "MarkOrganizationAsDeleted",
    variables: {
      organizationId: orgId,
      deleted: deleted,
    },
    query: `mutation MarkOrganizationAsDeleted(
      $organizationId: ID!
      $deleted: Boolean!
    ) {
      markOrganizationAsDeleted(
        organizationId: $organizationId,
        deleted: $deleted
      )
    }`,
  });
};
export const markPatientAsDeleted = (patientId, deleted) => {
  return cy.makePOSTRequest({
    operationName: "MarkPatientAsDeleted",
    variables: {
      patientId: patientId,
      deleted: deleted,
    },
    query: `mutation MarkPatientAsDeleted(
      $patientId: ID!
      $deleted: Boolean!
    ) {
      setPatientIsDeleted(
        id: $patientId,
        deleted: $deleted
      ) {
        id
      }
    }`,
  });
};

export const deleteOktaOrgs = (orgExternalId) => {
  return cy.makePOSTRequest({
    operationName: "DeleteE2EOktaOrganizations",
    variables: {
      orgExternalId: orgExternalId,
    },
    query: `mutation DeleteE2EOktaOrganizations(
      $orgExternalId: String!
    ) {
      deleteE2EOktaOrganizations(
        orgExternalId: $orgExternalId,
      ) {
        externalId
      }
    }`,
  });
};

export const createOrganization = (name, userEmail) => {
  return cy.makeAccountRequest({
    name: name,
    type: "camp",
    state: "CA",
    firstName: "Greg",
    middleName: "",
    lastName: "McTester",
    email: userEmail,
    workPhoneNumber: "2123892839",
  });
};
