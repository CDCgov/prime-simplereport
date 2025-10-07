export const whoAmI=()=>{
  return cy.makePOSTRequest({
    operationName: "WhoAmI",
    variables: {},
    query:
      "query WhoAmI {\n  whoami {\n organization {\n  id\n  facilities {\n      id\n    }\n  }\n} \n}",
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