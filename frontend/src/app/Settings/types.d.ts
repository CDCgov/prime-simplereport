type Nullable<T> = { [P in keyof T]: T[P] | null };

type ISODate =
  `${number}${number}${number}${number}-${number}${number}-${number}${number}`;

type RequiredExceptFor<T, TOptional extends keyof T> = Pick<
  T,
  Exclude<keyof T, TOptional>
> &
  Partial<T>;

interface DeviceType {
  supportedDiseases: { internalId: string; name: string }[];
  internalId: string;
  name: string;
  testLength?: number | undefined;
}

interface DeviceTypes {
  deviceType: [DeviceType];
}

interface SpecimenType {
  internalId: string;
  name: string;
}

interface DeviceSpecimenType {
  internalId: ID;
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
  deviceTypes: DeviceType[];
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
        deviceTypes: [
          {
            name: string;
            internalId: string;
            supportedDiseases: [
              {
                internalId: string;
                name: string;
              }
            ];
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
  deviceTypes: DeviceType[];
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
