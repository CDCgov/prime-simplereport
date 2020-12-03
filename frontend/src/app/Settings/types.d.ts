interface Address {
  street: string;
  streetTwo: string;
  city: string;
  county: string;
  state: string;
  zipCode: string;
}

interface Facility extends Address {
  cliaNumber: string;
  name: string;
  phone: string;
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
  internalId: string;
  testingFacility: Facility;
  orderingProvider: Provider;
  deviceTypes: string[];
  defaultDevice: string;
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
    testingFacility: {
      cliaNumber: string;
      name: string;
      street: string;
      streetTwo: string;
      city: string;
      county: string;
      state: string;
      zipCode: string;
      phone: string;
    };
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
    defaultDeviceType: {
      internalId: string;
    };
    deviceTypes: [
      {
        internalId: string;
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
