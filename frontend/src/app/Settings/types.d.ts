type Nullable<T> = { [P in keyof T]: T[P] | null };

type ISODate = `${number}${number}${number}${number}-${number}${number}-${number}${number}`;

interface DeviceType {
  internalId: string;
  name: string;
}
interface DeviceTypes {
  deviceType: [DeviceType];
}
interface SpecimenType {
  internalId: string;
  name: string;
  typeCode?: string;
  collectionLocationName?: string;
  collectionLocationCode?: string;
}

interface DeviceSpecimenTypeIds {
  deviceType: !ID;
  specimenType: !ID;
}

interface DeviceSpecimenTypes {
  deviceType: DeviceType;
  specimenType: SpecimenType;
}

interface Address {
  street: string;
  streetTwo: string | null;
  city: string | null;
  state: string;
  zipCode: string;
}

interface AddressWithMetaData extends Address {
  county: string;
}

interface Facility extends Address {
  id: string;
  cliaNumber: string;
  name: string;
  phone: string;
  email: string | null;
  deviceTypes: string[];
  deviceSpecimenTypes: DeviceSpecimenTypeIds[];
  defaultDevice: string;
  orderingProvider: Provider;
}

interface Provider extends Nullable<Address> {
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  suffix: string | null;
  NPI: string | null;
  phone: string | null;
}

interface Organization {
  name: string;
  externalId?: string;
  internalId: string;
  testingFacility: Facility[];
}

interface FacilityAdmin {
  firstName: string;
  middleName: string | null;
  lastName: string;
  suffix: string | null;
  email: string;
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

interface PhoneNumber {
  type: string;
  number: string;
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
        deviceSpecimenTypes: DeviceSpecimenTypes[];
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
        deviceSpecimenTypes: DeviceSpecimenTypes[];
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
  specimenType: [
    {
      internalId: string;
      name: string;
    }
  ];
}

type TestCorrectionStatus = "ORIGINAL" | "CORRECTED" | "REMOVED";

type OrganizationType =
  | "k12"
  | "university"
  | "correctional_facility"
  | "airport"
  | "shelter"
  | "fqhc"
  | "primary_care"
  | "assisted_living"
  | "hospital"
  | "urgent_care"
  | "nursing_home"
  | "treatment_center"
  | "hospice"
  | "pharmacy"
  | "employer"
  | "government_agency"
  | "camp"
  | "lab"
  | "other";
