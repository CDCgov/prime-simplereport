const whoAmIQuery = `
  query WhoAmI {
    whoami {
      organization {
        name
        externalId
        facilities {
          id
          name
        }
      }
    }
  }
`
export const whoAmI=()=>{
  return cy.makePOSTRequest({
    operationName: "WhoAmI",
    variables: {},
    query: whoAmIQuery,
  });
}

export const addMockFacility=(facilityName)=>{
return cy.makePOSTRequest({
  operationName: "AddFacility",
  variables: {
    "testingFacilityName":facilityName,
      "street":"123 maint street",
      "state":"NJ","zipCode":"07601",
      "orderingProviderFirstName":"Jane",
      "orderingProviderLastName":"Austen",
      "orderingProviderNPI":"1234567890",
      "orderingProviderStreet":"",
      "orderingProviderStreetTwo":"",
      "orderingProviderCity":"",
      "orderingProviderState":"",
      "orderingProviderZipCode":"",
      "orderingProviderPhone":"7328392412",
      "devices":[]},
  query:
    `mutation AddFacility(
  $testingFacilityName: String!
  $street: String!
  $state: String!
  $zipCode: String!
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
      }`;

const archivePatientMutation= `mutation ArchivePatient($patientId: ID!, $isDeleted: Boolean! $orgExternalId: String) {
      setPatientIsDeleted(
      id: $patientId
      deleted: $isDeleted
      orgExternalId: $orgExternalId
      ) {
              id
        }
      }`;


export const getPatientWithLastNameByFacilityWithOrg = (facilityId, patientLastName, orgExternalId) => {
  return cy.makePOSTRequest({
    operationName: "GetPatientsByFacilityWithOrg",
    variables: {
      facilityId: facilityId,
      pageNumber: 0,
      pageSize: 1,
      archivedStatus: "ALL",
      namePrefixMatch: patientLastName,
      orgExternalId: orgExternalId,
    },
    query: getPatientsByFacilityWithOrgQuery,
  });
};

export const unarchivePatient = (patientId, orgExternalId) => {
  return cy.makePOSTRequest({
    operationName: "ArchivePatient",
    variables: {
      patientId: patientId,
      isDeleted: false,
      orgExternalId: orgExternalId
    },
    query: archivePatientMutation,
  });
};
