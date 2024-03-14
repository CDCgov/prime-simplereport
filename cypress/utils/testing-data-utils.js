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

export const addDeviceToFacility = (facility, deviceIds) => {
  return cy.makePOSTRequest({
    operationName: "UpdateFacility",
    variables: {
      facilityId: facility.id,
      testingFacilityName: facility.name,
      street: facility.street,
      state: facility.state,
      zipCode: facility.zipCode,
      orderingProviderFirstName: "Test",
      orderingProviderMiddleName: "",
      orderingProviderLastName: "Provider",
      orderingProviderSuffix: "",
      orderingProviderNPI: "9876543210",
      orderingProviderStreet: "123 Main St",
      orderingProviderStreetTwo: "",
      orderingProviderCity: "Buffalo",
      orderingProviderState: "NY",
      orderingProviderZipCode: "14221",
      orderingProviderPhone: "716-555-5555",
      devices: deviceIds,
    },
    query: `
  mutation UpdateFacility(
    $facilityId: ID!
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
    updateFacility(
      facilityInfo: {
        facilityId: $facilityId
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
  }
`,
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

export const addPatient = ({
  facilityId: facilityId,
  firstName: firstName,
  middleName: middleName,
  lastName: lastName,
  birthDate: birthDate,
  street: street,
  streetTwo: streetTwo,
  city: city,
  state: state,
  zipCode: zipCode,
  country: country,
  telephone: telephone,
  phoneNumbers: phoneNumbers,
  role: role,
  lookupId: lookupId,
  emails: emails,
  county: county,
  race: race,
  ethnicity: ethnicity,
  tribalAffiliation: tribalAffiliation,
  gender: gender,
  residentCongregateSetting: residentCongregateSetting,
  employedInHealthcare: employedInHealthcare,
  preferredLanguage: preferredLanguage,
  testResultDelivery: testResultDelivery,
  notes: notes,
}) => {
  return cy.makePOSTRequest({
    operationName: "AddPatient",
    variables: {
      facilityId: facilityId,
      firstName: firstName,
      middleName: middleName,
      lastName: lastName,
      birthDate: birthDate,
      street: street,
      streetTwo: streetTwo,
      city: city,
      state: state,
      zipCode: zipCode,
      country: country,
      telephone: telephone,
      phoneNumbers: phoneNumbers,
      role: role,
      lookupId: lookupId,
      emails: emails,
      county: county,
      race: race,
      ethnicity: ethnicity,
      tribalAffiliation: tribalAffiliation,
      gender: gender,
      residentCongregateSetting: residentCongregateSetting,
      employedInHealthcare: employedInHealthcare,
      preferredLanguage: preferredLanguage,
      testResultDelivery: testResultDelivery,
      notes: notes,
    },
    query: `mutation AddPatient(
    $facilityId: ID
    $firstName: String!
    $middleName: String
    $lastName: String!
    $birthDate: LocalDate!
    $street: String!
    $streetTwo: String
    $city: String
    $state: String!
    $zipCode: String!
    $country: String!
    $telephone: String
    $phoneNumbers: [PhoneNumberInput!]
    $role: String
    $lookupId: String
    $emails: [String]
    $county: String
    $race: String
    $ethnicity: String
    $tribalAffiliation: String
    $gender: String
    $residentCongregateSetting: Boolean
    $employedInHealthcare: Boolean
    $preferredLanguage: String
    $testResultDelivery: TestResultDeliveryPreference
    $notes: String
  ) {
    addPatient(
      facilityId: $facilityId
      firstName: $firstName
      middleName: $middleName
      lastName: $lastName
      birthDate: $birthDate
      street: $street
      streetTwo: $streetTwo
      city: $city
      state: $state
      zipCode: $zipCode
      country: $country
      telephone: $telephone
      phoneNumbers: $phoneNumbers
      role: $role
      lookupId: $lookupId
      emails: $emails
      county: $county
      race: $race
      ethnicity: $ethnicity
      tribalAffiliation: $tribalAffiliation
      gender: $gender
      residentCongregateSetting: $residentCongregateSetting
      employedInHealthcare: $employedInHealthcare
      preferredLanguage: $preferredLanguage
      testResultDelivery: $testResultDelivery
      notes: $notes
    ) {
      internalId
      facility {
        id
      }
    }
  }`,
  });
};

export const createDeviceType = ({
  name: name,
  manufacturer: manufacturer,
  model: model,
  swabTypes: swabTypes,
  supportedDiseaseTestPerformed: supportedDiseaseTestPerformed,
  testLength: testLength,
}) => {
  return cy.makePOSTRequest({
    operationName: "createDeviceType",
    variables: {
      name: name,
      manufacturer: manufacturer,
      model: model,
      swabTypes: swabTypes,
      supportedDiseaseTestPerformed: supportedDiseaseTestPerformed,
      testLength: testLength,
    },
    query: `
  mutation createDeviceType(
    $name: String!
    $manufacturer: String!
    $model: String!
    $swabTypes: [ID!]!
    $supportedDiseaseTestPerformed: [SupportedDiseaseTestPerformedInput!]!
    $testLength: Int!
  ) {
    createDeviceType(
      input: {
        name: $name
        manufacturer: $manufacturer
        model: $model
        swabTypes: $swabTypes
        supportedDiseaseTestPerformed: $supportedDiseaseTestPerformed
        testLength: $testLength
      }
    ) {
      internalId
    }
  }
`,
  });
};

export const getSupportedDiseases = () => {
  return cy.makePOSTRequest({
    operationName: "supportedDiseases",
    query: `
  query supportedDiseases {
    supportedDiseases {
      internalId
      name
    }
  }
`,
  });
};

export const getSpecimenTypes = () => {
  return cy.makePOSTRequest({
    operationName: "specimenTypes",
    query: `
  query specimenTypes {
    specimenTypes {
      internalId
      name
      typeCode
    }
  }
`,
  });
};

export const updateFacility = () => {
  return cy.makePOSTRequest({
    operationName: "updateFacility",
    variables: {
      facilityInfo: facilityInfo,
    },
    query: `
  mutation updateFacility(
    $facilityInfo: UpdateFacilityInput!
  ) {
    updateFacility(
      input: {
        name: $name
        manufacturer: $manufacturer
        model: $model
        swabTypes: $swabTypes
        supportedDiseaseTestPerformed: $supportedDiseaseTestPerformed
        testLength: $testLength
      }
    ) {
      internalId
    }
  }
`,
  });
};

export const submitQueueItem = ({
  patientId: patientId,
  deviceTypeId: deviceTypeId,
  specimenTypeId: specimenTypeId,
  results: results,
  dateTested: dateTested,
}) => {
  return cy.makePOSTRequest({
    operationName: "SubmitQueueItem",
    variables: {
      patientId: patientId,
      deviceTypeId: deviceTypeId,
      specimenTypeId: specimenTypeId,
      results: results,
      dateTested: dateTested,
    },
    query: `mutation SubmitQueueItem(
    $patientId: ID!
    $deviceTypeId: ID!
    $specimenTypeId: ID!
    $results: [MultiplexResultInput]!
    $dateTested: DateTime
) {
    submitQueueItem(
        patientId: $patientId
        deviceTypeId: $deviceTypeId
        specimenTypeId: $specimenTypeId
        results: $results
        dateTested: $dateTested
    ) {
        testResult {
            internalId
        }
        deliverySuccess
        testEventId
    }
}`,
  });
};

export const getPatient = () => {
  return cy.makePOSTRequest({
    operationName: "patient",
    query: `
  query GetPatient($internalId: ID!) {
    patient(id: $internalId) {
      internalId
      firstName
      lastName
      middleName
      birthDate
      gender
      telephone
      phoneNumbers {
        type
        number
      }
      emails
      testResultDelivery
    }
  }
`,
  });
};

export const addPatientToQueue = ({
  facilityId: facilityId,
  patientId: patientId,
}) => {
  return cy.makePOSTRequest({
    operationName: "AddPatientToQueue",
    variables: {
      facilityId: facilityId,
      patientId: patientId,
    },
    query: `
  mutation AddPatientToQueue(
    $facilityId: ID!
    $patientId: ID!
  ) {
    addPatientToQueue(
      facilityId: $facilityId
      patientId: $patientId
    )
  }
`,
  });
};
