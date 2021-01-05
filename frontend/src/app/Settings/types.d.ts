interface Address {
  street: string;
  streetTwo: string;
  city: string;
  county: string;
  state: string;
  zipCode: string;
}

interface Facility extends Address {
  id: string;
  cliaNumber: string;
  name: string;
  phone: string;
  email: string;
  deviceTypes: string[];
  defaultDevice: string;
  orderingProvider: Provider;
}

interface Provider extends Address {
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  NPI: string;
  phone: string;
}

interface Organization {
  name: string;
  internalId: string;
  testingFacility: Facility[];
}

interface FlatOrganization {
  testingFacilityName: string;
  cliaNumber: string;
  orderingProviderFirstName: string;
  orderingProviderMiddleName: string;
  orderingProviderLastName: string;
  orderingProviderSuffix: string;
  orderingProviderNPI: string;
  orderingProviderStreet: string;
  orderingProviderStreetTwo: string;
  orderingProviderCity: string;
  orderingProviderCounty: string;
  orderingProviderState: string;
  orderingProviderZipCode: string;
  orderingProviderPhone: string;
  deviceTypes: string[];
  defaultDevice: string;
}

interface DeviceType {
  internalId: string;
  name: string;
}

interface SettingsData {
  organization: {
    internalId: string;
    name: string;
    testingFacility: [
      {
        id: string;
        cliaNumber: string;
        name: string;
        street: string;
        streetTwo: string;
        city: string;
        county: string;
        state: string;
        zipCode: string;
        phone: string;
        email: string;
        defaultDeviceType: {
          internalId: string;
        };
        deviceTypes: [
          {
            internalId: string;
          }
        ];
        orderingProvider: {
          firstName: string;
          middleName: string;
          lastName: string;
          suffix: string;
          NPI: string;
          street: string;
          streetTwo: string;
          city: string;
          county: string;
          state: string;
          zipCode: string;
          phone: string;
        };
      }
    ];
  };
  deviceType: [
    {
      internalId: string;
      name: string;
    }
  ];
}

interface FacilityData {
  organization: {
    internalId: string;
    name: string;
    testingFacility: [
      {
        id: string;
        cliaNumber: string;
        name: string;
        street: string;
        streetTwo: string;
        city: string;
        county: string;
        state: string;
        zipCode: string;
        phone: string;
        email: string;
        defaultDeviceType: {
          internalId: string;
        };
        deviceTypes: [
          {
            internalId: string;
          }
        ];
        orderingProvider: {
          firstName: string;
          middleName: string;
          lastName: string;
          suffix: string;
          NPI: string;
          street: string;
          streetTwo: string;
          city: string;
          county: string;
          state: string;
          zipCode: string;
          phone: string;
        };
      }
    ];
  };
  deviceType: [
    {
      internalId: string;
      name: string;
    }
  ];
}
