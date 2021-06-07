import { makeVar } from "@apollo/client";

export const facilities = makeVar<FacilitiesState>({ current: null, list: [] });

export const appConfig = makeVar<AppConfigState>({
  dataLoaded: false,
  user: {
    id: "",
    firstName: "",
    middleName: "",
    lastName: "",
    suffix: "",
    email: "",
    permissions: [],
    roleDescription: "",
    isAdmin: false,
  },
  organization: {
    name: "",
  },
  activationToken: null,
});

export const patient = makeVar<Patient>({
  firstName: "",
  lastName: "",
  middleName: "",
  birthDate: new Date(),
  facilityId: "",
  city: "",
  state: "",
  zipCode: "",
  lookupId: "",
  role: "",
  race: "other",
  ethnicity: "refused",
  gender: "other",
  tribalAffiliation: "1",
  telephone: "",
  phoneNumbers: null,
  county: "",
  email: "",
  preferredLanguage: null,
  residentCongregateSetting: null,
  employedInHealthcare: null,
  street: "",
  streetTwo: "",
  internalId: "",
  testResultDelivery: "",
  lastTest: undefined,
});

const store = {
  facilities,
  appConfig,
  patient,
};

export default store;
