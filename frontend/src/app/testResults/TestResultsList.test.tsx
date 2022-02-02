import qs from "querystring";

import { MockedProvider } from "@apollo/client/testing";
import {
  render,
  screen,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import configureStore from "redux-mock-store";
import userEvent from "@testing-library/user-event";

import { GetFacilityResultsForCsvDocument } from "../../generated/graphql";
import { QUERY_PATIENT } from "../testQueue/addToQueue/AddToQueueSearch";

import { testResultDetailsQuery } from "./TestResultDetailsModal";
import TestResultsList, {
  DetachedTestResultsList,
  resultsCountQuery,
  testResultQuery,
} from "./TestResultsList";

const mockStore = configureStore([]);
const store = mockStore({
  organization: {
    name: "Organization Name",
  },
  user: {
    firstName: "Kim",
    lastName: "Mendoza",
  },
  facilities: [
    { id: "1", name: "Facility 1" },
    { id: "2", name: "Facility 2" },
  ],
  facility: { id: "1", name: "Facility 1" },
});

jest.mock("@microsoft/applicationinsights-react-js", () => ({
  useAppInsightsContext: () => {},
  useTrackEvent: jest.fn(),
}));

jest.mock("./EmailTestResultModal", () => () => <p>Email result modal</p>);

const WithRouter: React.FC = ({ children }) => (
  <MemoryRouter initialEntries={[{ search: "?facility=1" }]}>
    {children}
  </MemoryRouter>
);

// Data copied from Chrome network window
const testResults = [
  {
    internalId: "0969da96-b211-41cd-ba61-002181f0918d",
    dateTested: "2021-03-17T19:27:23.806Z",
    result: "NEGATIVE",
    correctionStatus: "ORIGINAL",
    deviceType: {
      internalId: "8c1a8efe-8951-4f84-a4c9-dcea561d7fbb",
      name: "Abbott IDNow",
      __typename: "DeviceType",
    },
    patient: {
      internalId: "48c523e8-7c65-4047-955c-e3f65bb8b58a",
      firstName: "Barb",
      middleName: "Whitaker",
      lastName: "Cragell",
      birthDate: "1960-11-07",
      gender: "male",
      role: "RESIDENT",
      lookupId: null,
      __typename: "Patient",
    },
    createdBy: {
      nameInfo: {
        firstName: "Arthur",
        middleName: "A",
        lastName: "Admin",
      },
    },
    patientLink: {
      internalId: "68c543e8-7c65-4047-955c-e3f65bb8b58a",
    },
    noSymptoms: true,
    symptoms: "{}",
    __typename: "TestResult",
  },
  {
    internalId: "7c768a5d-ef90-44cd-8050-b96dd77f51d5",
    dateTested: "2021-03-18T19:27:21.052Z",
    result: "NEGATIVE",
    correctionStatus: "ORIGINAL",
    deviceType: {
      internalId: "8c1a8efe-8951-4f84-a4c9-dcea561d7fbb",
      name: "Abbott IDNow",
      __typename: "DeviceType",
    },
    patient: {
      internalId: "f74ad245-3a69-44b5-bb6d-efe06308bb85",
      firstName: "Barde",
      middleName: "X",
      lastName: "Colleer",
      birthDate: "1960-11-07",
      gender: "female",
      role: "STAFF",
      lookupId: null,
      __typename: "Patient",
    },
    createdBy: {
      nameInfo: {
        firstName: "Ursula",
        middleName: "",
        lastName: "User",
      },
    },
    patientLink: {
      internalId: "68c543e8-7c65-4047-955c-e3f65bb8b58a",
    },
    noSymptoms: false,
    symptoms: "{}",
    __typename: "TestResult",
  },
  {
    internalId: "7c768a5d-ef90-44cd-8050-b96dd7aaa1d5",
    dateTested: "2021-03-19T19:27:21.052Z",
    result: "POSITIVE",
    correctionStatus: "ORIGINAL",
    deviceType: {
      internalId: "8c1a8efe-8951-4f84-a4c9-dcea561d7fbb",
      name: "Abbott IDNow",
      __typename: "DeviceType",
    },
    patient: {
      internalId: "f74ad245-3a69-44b5-bb6d-efe06308bb85",
      firstName: "Sam",
      middleName: "G",
      lastName: "Gerard",
      birthDate: "1960-11-07",
      gender: "male",
      role: "RESIDENT",
      lookupId: null,
      email: "sam@gerard.com",
      __typename: "Patient",
    },
    createdBy: {
      nameInfo: {
        firstName: "Ethan",
        middleName: "",
        lastName: "Entry",
      },
    },
    patientLink: {
      internalId: "68c543e8-7c65-4047-955c-e3f65bb8b58a",
    },
    noSymptoms: false,
    symptoms: '{"someSymptom":"true"}',
    __typename: "TestResult",
  },
];

const testResultsForCsv = [
  {
    facility: { name: "Central Middle School", __typename: "Facility" },
    dateTested: "2022-01-19T16:45:11.446Z",
    result: "NEGATIVE",
    correctionStatus: "ORIGINAL",
    reasonForCorrection: null,
    deviceType: {
      name: "Cue",
      manufacturer: "CueTM",
      model: "Cue COVID Test",
      swabType: "45345873",
      __typename: "DeviceType",
    },
    patient: {
      internalId: "48c523e8-7c65-4047-955c-e3f65bb8b58a",
      firstName: "Barb",
      middleName: "Whitaker",
      lastName: "Cragell",
      birthDate: "1960-11-07",
      gender: "male",
      role: "RESIDENT",
      race: "asian",
      ethnicity: "not_hispanic",
      tribalAffiliation: [null],
      lookupId: null,
      telephone: "(905) 594-3725",
      email: "fimevusuwu@mailinator.com",
      street: "67 White Oak Avenue",
      streetTwo: "Voluptatem optio in",
      city: "Magna ut corrupti s",
      county: "Maiores et sunt et q",
      state: "NA",
      zipCode: "00000",
      country: null,
      residentCongregateSetting: null,
      employedInHealthcare: null,
      preferredLanguage: null,
      __typename: "Patient",
    },
    createdBy: {
      nameInfo: {
        firstName: "Nathan",
        middleName: null,
        lastName: "Carter",
        __typename: "NameInfo",
      },
      __typename: "ApiUser",
    },
    symptoms:
      '{"64531003":"false","103001002":"false","84229001":"false","68235000":"false","426000000":"false","49727002":"false","68962001":"false","422587007":"false","267036007":"false","62315008":"false","43724002":"false","36955009":"false","44169009":"false","422400008":"false","230145002":"false","25064002":"false","162397003":"false"}',
    noSymptoms: false,
    symptomOnset: null,
    __typename: "TestResult",
  },
  {
    facility: { name: "Central Middle School", __typename: "Facility" },
    dateTested: "2022-01-19T16:42:46.744Z",
    result: "NEGATIVE",
    correctionStatus: "ORIGINAL",
    reasonForCorrection: null,
    deviceType: {
      name: "Cue",
      manufacturer: "CueTM",
      model: "Cue COVID Test",
      swabType: "45345873",
      __typename: "DeviceType",
    },
    patient: {
      firstName: "Cadman",
      middleName: "Burton Conner",
      lastName: "Day",
      birthDate: "1903-04-07",
      gender: "male",
      race: "asian",
      ethnicity: "not_hispanic",
      tribalAffiliation: [null],
      lookupId: null,
      telephone: "(905) 594-3725",
      email: "fimevusuwu@mailinator.com",
      street: "67 White Oak Avenue",
      streetTwo: "Voluptatem optio in",
      city: "Magna ut corrupti s",
      county: "Maiores et sunt et q",
      state: "NA",
      zipCode: "00000",
      country: null,
      role: "STUDENT",
      residentCongregateSetting: null,
      employedInHealthcare: null,
      preferredLanguage: null,
      __typename: "Patient",
    },
    createdBy: {
      nameInfo: {
        firstName: "Nathan",
        middleName: null,
        lastName: "Carter",
        __typename: "NameInfo",
      },
      __typename: "ApiUser",
    },
    symptoms:
      '{"64531003":"false","103001002":"false","84229001":"false","68235000":"false","426000000":"false","49727002":"false","68962001":"false","422587007":"false","267036007":"false","62315008":"false","43724002":"false","36955009":"false","44169009":"false","422400008":"false","230145002":"false","25064002":"false","162397003":"false"}',
    noSymptoms: false,
    symptomOnset: null,
    __typename: "TestResult",
  },
  {
    facility: { name: "Central Middle School", __typename: "Facility" },
    dateTested: "2022-01-13T22:44:52.193Z",
    result: "POSITIVE",
    correctionStatus: "ORIGINAL",
    reasonForCorrection: null,
    deviceType: {
      name: "Cue",
      manufacturer: "CueTM",
      model: "Cue COVID Test",
      swabType: "45345873",
      __typename: "DeviceType",
    },
    patient: {
      firstName: "Bob",
      middleName: null,
      lastName: "International",
      birthDate: "1970-09-09",
      gender: "male",
      race: null,
      ethnicity: null,
      tribalAffiliation: [null],
      lookupId: null,
      telephone: "(530) 867-5309",
      email: "zedd@skylight.digital",
      street: "123 Main St",
      streetTwo: "",
      city: null,
      county: null,
      state: "CA",
      zipCode: "95820",
      country: "USA",
      role: "UNKNOWN",
      residentCongregateSetting: null,
      employedInHealthcare: null,
      preferredLanguage: null,
      __typename: "Patient",
    },
    createdBy: {
      nameInfo: {
        firstName: "Zedd",
        middleName: null,
        lastName: "Shmais",
        __typename: "NameInfo",
      },
      __typename: "ApiUser",
    },
    symptoms:
      '{"64531003":"false","103001002":"false","84229001":"false","68235000":"false","426000000":"false","49727002":"false","68962001":"false","422587007":"false","267036007":"false","62315008":"false","43724002":"false","36955009":"false","44169009":"false","422400008":"false","230145002":"false","25064002":"false","162397003":"false"}',
    noSymptoms: false,
    symptomOnset: null,
    __typename: "TestResult",
  },
];

const testResultsByPatient = [
  {
    internalId: "0969da96-b211-41cd-ba61-002181f0918d",
    dateTested: "2021-03-17T19:27:23.806Z",
    result: "NEGATIVE",
    correctionStatus: "ORIGINAL",
    deviceType: {
      internalId: "8c1a8efe-8951-4f84-a4c9-dcea561d7fbb",
      name: "Abbott IDNow",
      __typename: "DeviceType",
    },
    patient: {
      internalId: "48c523e8-7c65-4047-955c-e3f65bb8b58a",
      firstName: "Barb",
      middleName: "Whitaker",
      lastName: "Cragell",
      birthDate: "1960-11-07",
      gender: "male",
      role: "RESIDENT",
      lookupId: null,
      __typename: "Patient",
    },
    createdBy: {
      nameInfo: {
        firstName: "Arthur",
        middleName: "A",
        lastName: "Admin",
      },
    },
    patientLink: {
      internalId: "68c543e8-7c65-4047-955c-e3f65bb8b58a",
    },
    noSymptoms: true,
    symptoms: "{}",
    __typename: "TestResult",
  },
];

const testResultsByResultValue = [
  {
    internalId: "0969da96-b211-41cd-ba61-002181f0918d",
    dateTested: "2021-03-17T19:27:23.806Z",
    result: "NEGATIVE",
    correctionStatus: "ORIGINAL",
    deviceType: {
      internalId: "8c1a8efe-8951-4f84-a4c9-dcea561d7fbb",
      name: "Abbott IDNow",
      __typename: "DeviceType",
    },
    patient: {
      internalId: "48c523e8-7c65-4047-955c-e3f65bb8b58a",
      firstName: "Barb",
      middleName: "Whitaker",
      lastName: "Cragell",
      birthDate: "1960-11-07",
      gender: "male",
      role: "RESIDENT",
      lookupId: null,
      __typename: "Patient",
    },
    createdBy: {
      nameInfo: {
        firstName: "Arthur",
        middleName: "A",
        lastName: "Admin",
      },
    },
    patientLink: {
      internalId: "68c543e8-7c65-4047-955c-e3f65bb8b58a",
    },
    noSymptoms: true,
    symptoms: "{}",
    __typename: "TestResult",
  },
  {
    internalId: "7c768a5d-ef90-44cd-8050-b96dd77f51d5",
    dateTested: "2021-03-18T19:27:21.052Z",
    result: "NEGATIVE",
    correctionStatus: "ORIGINAL",
    deviceType: {
      internalId: "8c1a8efe-8951-4f84-a4c9-dcea561d7fbb",
      name: "Abbott IDNow",
      __typename: "DeviceType",
    },
    patient: {
      internalId: "f74ad245-3a69-44b5-bb6d-efe06308bb85",
      firstName: "Barde",
      middleName: "X",
      lastName: "Colleer",
      birthDate: "1960-11-07",
      gender: "female",
      role: "STAFF",
      lookupId: null,
      __typename: "Patient",
    },
    createdBy: {
      nameInfo: {
        firstName: "Ursula",
        middleName: "",
        lastName: "User",
      },
    },
    patientLink: {
      internalId: "68c543e8-7c65-4047-955c-e3f65bb8b58a",
    },
    noSymptoms: false,
    symptoms: "{}",
    __typename: "TestResult",
  },
];

const testResultsByRole = [
  {
    internalId: "0969da96-b211-41cd-ba61-002181f0918d",
    dateTested: "2021-03-17T19:27:23.806Z",
    result: "NEGATIVE",
    correctionStatus: "ORIGINAL",
    deviceType: {
      internalId: "8c1a8efe-8951-4f84-a4c9-dcea561d7fbb",
      name: "Abbott IDNow",
      __typename: "DeviceType",
    },
    patient: {
      internalId: "48c523e8-7c65-4047-955c-e3f65bb8b58a",
      firstName: "Barb",
      middleName: "Whitaker",
      lastName: "Cragell",
      birthDate: "1960-11-07",
      gender: "male",
      role: "RESIDENT",
      lookupId: null,
      __typename: "Patient",
    },
    createdBy: {
      nameInfo: {
        firstName: "Arthur",
        middleName: "A",
        lastName: "Admin",
      },
    },
    patientLink: {
      internalId: "68c543e8-7c65-4047-955c-e3f65bb8b58a",
    },
    noSymptoms: true,
    symptoms: "{}",
    __typename: "TestResult",
  },
  {
    internalId: "7c768a5d-ef90-44cd-8050-b96dd7aaa1d5",
    dateTested: "2021-03-19T19:27:21.052Z",
    result: "POSITIVE",
    correctionStatus: "ORIGINAL",
    deviceType: {
      internalId: "8c1a8efe-8951-4f84-a4c9-dcea561d7fbb",
      name: "Abbott IDNow",
      __typename: "DeviceType",
    },
    patient: {
      internalId: "f74ad245-3a69-44b5-bb6d-efe06308bb85",
      firstName: "Sam",
      middleName: "G",
      lastName: "Gerard",
      birthDate: "1960-11-07",
      gender: "male",
      role: "RESIDENT",
      lookupId: null,
      __typename: "Patient",
    },
    createdBy: {
      nameInfo: {
        firstName: "Ethan",
        middleName: "",
        lastName: "Entry",
      },
    },
    patientLink: {
      internalId: "68c543e8-7c65-4047-955c-e3f65bb8b58a",
    },
    noSymptoms: false,
    symptoms: '{"someSymptom":"true"}',
    __typename: "TestResult",
  },
];

const testResultsByStartDate = [
  {
    internalId: "7c768a5d-ef90-44cd-8050-b96dd77f51d5",
    dateTested: "2021-03-18T19:27:21.052Z",
    result: "NEGATIVE",
    correctionStatus: "ORIGINAL",
    deviceType: {
      internalId: "8c1a8efe-8951-4f84-a4c9-dcea561d7fbb",
      name: "Abbott IDNow",
      __typename: "DeviceType",
    },
    patient: {
      internalId: "f74ad245-3a69-44b5-bb6d-efe06308bb85",
      firstName: "Barde",
      middleName: "X",
      lastName: "Colleer",
      birthDate: "1960-11-07",
      gender: "female",
      role: "STAFF",
      lookupId: null,
      __typename: "Patient",
    },
    createdBy: {
      nameInfo: {
        firstName: "Ursula",
        middleName: "",
        lastName: "User",
      },
    },
    patientLink: {
      internalId: "68c543e8-7c65-4047-955c-e3f65bb8b58a",
    },
    noSymptoms: false,
    symptoms: "{}",
    __typename: "TestResult",
  },
  {
    internalId: "7c768a5d-ef90-44cd-8050-b96dd7aaa1d5",
    dateTested: "2021-03-19T19:27:21.052Z",
    result: "POSITIVE",
    correctionStatus: "ORIGINAL",
    deviceType: {
      internalId: "8c1a8efe-8951-4f84-a4c9-dcea561d7fbb",
      name: "Abbott IDNow",
      __typename: "DeviceType",
    },
    patient: {
      internalId: "f74ad245-3a69-44b5-bb6d-efe06308bb85",
      firstName: "Sam",
      middleName: "G",
      lastName: "Gerard",
      birthDate: "1960-11-07",
      gender: "male",
      role: "RESIDENT",
      lookupId: null,
      __typename: "Patient",
    },
    createdBy: {
      nameInfo: {
        firstName: "Ethan",
        middleName: "",
        lastName: "Entry",
      },
    },
    patientLink: {
      internalId: "68c543e8-7c65-4047-955c-e3f65bb8b58a",
    },
    noSymptoms: false,
    symptoms: '{"someSymptom":"true"}',
    __typename: "TestResult",
  },
];

const testResultsByStartDateAndEndDate = [
  {
    internalId: "7c768a5d-ef90-44cd-8050-b96dd77f51d5",
    dateTested: "2021-03-18T19:27:21.052Z",
    result: "NEGATIVE",
    correctionStatus: "ORIGINAL",
    deviceType: {
      internalId: "8c1a8efe-8951-4f84-a4c9-dcea561d7fbb",
      name: "Abbott IDNow",
      __typename: "DeviceType",
    },
    patient: {
      internalId: "f74ad245-3a69-44b5-bb6d-efe06308bb85",
      firstName: "Barde",
      middleName: "X",
      lastName: "Colleer",
      birthDate: "1960-11-07",
      gender: "female",
      role: "STAFF",
      lookupId: null,
      __typename: "Patient",
    },
    createdBy: {
      nameInfo: {
        firstName: "Ursula",
        middleName: "",
        lastName: "User",
      },
    },
    patientLink: {
      internalId: "68c543e8-7c65-4047-955c-e3f65bb8b58a",
    },
    noSymptoms: false,
    symptoms: "{}",
    __typename: "TestResult",
  },
];

const patients = [
  {
    internalId: "48c523e8-7c65-4047-955c-e3f65bb8b58a",
    firstName: "Barb",
    middleName: "Whitaker",
    lastName: "Cragell",
    birthDate: "1960-11-07",
    gender: "male",
    role: "RESIDENT",
    lookupId: null,
    __typename: "Patient",
  },
];

const mocks = [
  {
    request: {
      query: resultsCountQuery,
      variables: {
        facilityId: "1",
      },
    },
    result: {
      data: {
        testResultsCount: testResults.length,
      },
    },
  },
  {
    request: {
      query: testResultQuery,
      variables: {
        facilityId: "1",
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        testResults,
      },
    },
  },
  {
    request: {
      query: GetFacilityResultsForCsvDocument,
      variables: {
        facilityId: "1",
        pageNumber: 0,
        pageSize: 3,
      },
    },
    result: {
      data: {
        testResults: testResultsForCsv,
      },
    },
  },
  {
    request: {
      query: testResultDetailsQuery,
      variables: {
        id: testResults[0].internalId,
      },
    },
    result: {
      data: {
        testResult: {
          dateTested: "2021-03-17T19:27:23.806Z",
          result: "NEGATIVE",
          correctionStatus: "ORIGINAL",
          deviceType: {
            name: "Abbott IDNow",
            __typename: "DeviceType",
          },
          patient: {
            firstName: "Barb",
            middleName: "Whitaker",
            lastName: "Cragell",
            birthDate: "1960-11-07",
          },
          createdBy: {
            name: {
              firstName: "Arthur",
              middleName: "A",
              lastName: "Admin",
            },
          },
          symptoms: "{}",
          symptomOnset: null,
          __typename: "TestResult",
        },
      },
    },
  },
  {
    request: {
      query: resultsCountQuery,
      variables: {
        facilityId: "1",
        patientId: "48c523e8-7c65-4047-955c-e3f65bb8b58a",
      },
    },
    result: {
      data: {
        testResultsCount: testResultsByPatient.length,
      },
    },
  },
  {
    request: {
      query: testResultQuery,
      variables: {
        facilityId: "1",
        patientId: "48c523e8-7c65-4047-955c-e3f65bb8b58a",
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        testResults: testResultsByPatient,
      },
    },
  },
  {
    request: {
      query: resultsCountQuery,
      variables: {
        facilityId: "1",
        result: "NEGATIVE",
      },
    },
    result: {
      data: {
        testResultsCount: testResultsByResultValue.length,
      },
    },
  },
  {
    request: {
      query: testResultQuery,
      variables: {
        facilityId: "1",
        result: "NEGATIVE",
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        testResults: testResultsByResultValue,
      },
    },
  },
  {
    request: {
      query: resultsCountQuery,
      variables: {
        facilityId: "1",
        role: "RESIDENT",
      },
    },
    result: {
      data: {
        testResultsCount: testResultsByRole.length,
      },
    },
  },
  {
    request: {
      query: testResultQuery,
      variables: {
        facilityId: "1",
        role: "RESIDENT",
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        testResults: testResultsByRole,
      },
    },
  },
  {
    request: {
      query: resultsCountQuery,
      variables: {
        facilityId: "1",
        startDate: "2021-03-18T00:00:00.000Z",
      },
    },
    result: {
      data: {
        testResultsCount: testResultsByStartDate.length,
      },
    },
  },
  {
    request: {
      query: testResultQuery,
      variables: {
        facilityId: "1",
        startDate: "2021-03-18T00:00:00.000Z",
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        testResults: testResultsByStartDate,
      },
    },
  },
  {
    request: {
      query: resultsCountQuery,
      variables: {
        facilityId: "1",
        startDate: "2021-03-18T00:00:00.000Z",
        endDate: "2021-03-18T23:59:59.999Z",
      },
    },
    result: {
      data: {
        testResultsCount: testResultsByStartDateAndEndDate.length,
      },
    },
  },
  {
    request: {
      query: testResultQuery,
      variables: {
        facilityId: "1",
        startDate: "2021-03-18T00:00:00.000Z",
        endDate: "2021-03-18T23:59:59.999Z",
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        testResults: testResultsByStartDateAndEndDate,
      },
    },
  },
  {
    request: {
      query: QUERY_PATIENT,
      variables: {
        facilityId: "1",
        namePrefixMatch: "Cragell",
      },
    },
    result: {
      data: {
        patients,
      },
    },
  },
  {
    request: {
      query: resultsCountQuery,
      variables: {
        facilityId: "1",
      },
    },
    result: {
      data: {
        testResultsCount: testResults.length,
      },
    },
  },
  {
    request: {
      query: testResultQuery,
      variables: {
        facilityId: "1",
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        testResults,
      },
    },
  },
];

describe("TestResultsList", () => {
  it("should render a list of tests", async () => {
    const { container } = render(
      <WithRouter>
        <MockedProvider mocks={[]}>
          <DetachedTestResultsList
            data={{ testResults }}
            pageNumber={1}
            entriesPerPage={20}
            totalEntries={testResults.length}
            filterParams={{}}
            setFilterParams={() => () => {}}
            clearFilterParams={() => {}}
            facilityId={"1"}
            loading={false}
            loadingTotalResults={false}
            refetch={() => {}}
          />
        </MockedProvider>
      </WithRouter>
    );

    expect(
      await screen.findByText("Test Results", { exact: false })
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Cragell, Barb Whitaker")
    ).toBeInTheDocument();
    expect(await screen.findByText("Showing 1-3 of 3")).toBeInTheDocument();

    expect(container).toMatchSnapshot();
  });
  it("should be able to load filter params from url", async () => {
    const localMocks = [
      {
        request: {
          query: resultsCountQuery,
          variables: {
            facilityId: "1",
            patientId: "48c523e8-7c65-4047-955c-e3f65bb8b58a",
            startDate: "2021-03-18T00:00:00.000Z",
            endDate: "2021-03-19T23:59:59.999Z",
            role: "STAFF",
            result: "NEGATIVE",
          },
        },
        result: {
          data: {
            testResultsCount: testResultsByStartDateAndEndDate.length,
          },
        },
      },
      {
        request: {
          query: testResultQuery,
          variables: {
            facilityId: "1",
            pageNumber: 0,
            pageSize: 20,
            patientId: "48c523e8-7c65-4047-955c-e3f65bb8b58a",
            startDate: "2021-03-18T00:00:00.000Z",
            endDate: "2021-03-19T23:59:59.999Z",
            role: "STAFF",
            result: "NEGATIVE",
          },
        },
        result: {
          data: {
            testResults: testResultsByStartDateAndEndDate,
          },
        },
      },
    ];
    const search = {
      patientId: "48c523e8-7c65-4047-955c-e3f65bb8b58a",
      startDate: "2021-03-18T00:00:00.000Z",
      endDate: "2021-03-19T23:59:59.999Z",
      result: "NEGATIVE",
      role: "STAFF",
      facility: "1",
    };

    await render(
      <MemoryRouter
        initialEntries={[
          { pathname: "/results/1", search: qs.stringify(search) },
        ]}
      >
        <Provider store={store}>
          <MockedProvider mocks={localMocks}>
            <TestResultsList pageNumber={1} />
          </MockedProvider>
        </Provider>
      </MemoryRouter>
    );

    expect(await screen.findByText("Showing 1-1 of 1")).toBeInTheDocument();
    expect(
      await screen.findByLabelText("Date range (start)")
    ).toBeInTheDocument();
    expect(await screen.findByDisplayValue("03/18/2021")).toBeInTheDocument();

    expect(
      await screen.findByLabelText("Date range (end)")
    ).toBeInTheDocument();
    expect(await screen.findByDisplayValue("03/19/2021")).toBeInTheDocument();

    const roleSelect = (await screen.findByLabelText(
      "Role"
    )) as HTMLSelectElement;
    expect(roleSelect).toBeInTheDocument();
    expect(roleSelect.value).toEqual("STAFF");

    const resultSelect = (await screen.findByLabelText(
      "Result"
    )) as HTMLSelectElement;
    expect(resultSelect).toBeInTheDocument();
    expect(resultSelect.value).toEqual("NEGATIVE");

    const searchBox = screen.getByLabelText(
      "Search by name"
    ) as HTMLInputElement;
    expect(searchBox.value).toEqual("Colleer, Barde X");

    const row = within(await screen.findByTitle("filtered-result"));
    expect(await row.findByText("Colleer, Barde X")).toBeInTheDocument();
    expect(await row.findByText("DOB: 11/07/1960")).toBeInTheDocument();
    expect(await row.findByText("Negative")).toBeInTheDocument();
    expect(await row.findByText("Abbott IDNow")).toBeInTheDocument();
    expect(await row.findByText("User, Ursula")).toBeInTheDocument();
  });
  describe("with mocks", () => {
    beforeEach(() => {
      render(
        <WithRouter>
          <Provider store={store}>
            <MockedProvider mocks={mocks}>
              <TestResultsList pageNumber={1} />
            </MockedProvider>
          </Provider>
        </WithRouter>
      );
    });

    it("should call appropriate gql endpoints for pagination", async () => {
      expect(
        await screen.findByText("Test Results", { exact: false })
      ).toBeInTheDocument();
      expect(
        await screen.findByText("Cragell, Barb Whitaker")
      ).toBeInTheDocument();
    });

    it("should be able to filter by patient", async () => {
      expect(
        await screen.findByText("Test Results", { exact: false })
      ).toBeInTheDocument();
      expect(
        await screen.findByText("Cragell, Barb Whitaker")
      ).toBeInTheDocument();
      expect(await screen.findByText("Colleer, Barde X")).toBeInTheDocument();
      expect(await screen.findByText("Search by name")).toBeInTheDocument();
      userEvent.type(screen.getByRole("searchbox"), "Cragell");
      expect(await screen.findByText("Filter")).toBeInTheDocument();
      userEvent.click(screen.getByText("Filter"));
      expect(
        await screen.findByText("Cragell, Barb Whitaker")
      ).toBeInTheDocument();
      expect(screen.queryByText("Colleer, Barde X")).not.toBeInTheDocument();
      expect(screen.getByRole("searchbox")).toHaveValue(
        "Cragell, Barb Whitaker"
      );
    });
    it("should be able to filter by result value", async () => {
      expect(
        await screen.findByText("Test Results", { exact: false })
      ).toBeInTheDocument();
      expect(
        await screen.findByText("Cragell, Barb Whitaker")
      ).toBeInTheDocument();
      expect(await screen.findByText("Gerard, Sam G")).toBeInTheDocument();
      expect(
        await screen.findByRole("option", { name: "Negative" })
      ).toBeInTheDocument();
      userEvent.selectOptions(screen.getByLabelText("Result"), ["NEGATIVE"]);
      expect(
        await screen.findByText("Cragell, Barb Whitaker")
      ).toBeInTheDocument();
      expect(screen.queryByText("Gerard, Sam G")).not.toBeInTheDocument();
    });
    it("should be able to filter by role", async () => {
      expect(
        await screen.findByText("Test Results", { exact: false })
      ).toBeInTheDocument();
      expect(
        await screen.findByText("Cragell, Barb Whitaker")
      ).toBeInTheDocument();
      expect(await screen.findByText("Colleer, Barde X")).toBeInTheDocument();
      expect(
        await screen.findByRole("option", { name: "Resident" })
      ).toBeInTheDocument();
      userEvent.selectOptions(screen.getByLabelText("Role"), ["RESIDENT"]);
      expect(
        await screen.findByText("Cragell, Barb Whitaker")
      ).toBeInTheDocument();
      expect(screen.queryByText("Colleer, Barde X")).not.toBeInTheDocument();
    });
    it("should be able to filter by date", async () => {
      expect(
        await screen.findByText("Test Results", { exact: false })
      ).toBeInTheDocument();
      expect(
        await screen.findByText("Cragell, Barb Whitaker")
      ).toBeInTheDocument();
      expect(await screen.findByText("Colleer, Barde X")).toBeInTheDocument();
      expect(await screen.findByText("Gerard, Sam G")).toBeInTheDocument();
      expect(await screen.findByText("Date range (start)")).toBeInTheDocument();
      expect(await screen.findByText("Date range (end)")).toBeInTheDocument();
      userEvent.type(
        screen.getAllByTestId("date-picker-external-input")[0],
        "03/18/2021"
      );
      userEvent.tab();
      expect(await screen.findByText("Colleer, Barde X")).toBeInTheDocument();
      expect(await screen.findByText("Gerard, Sam G")).toBeInTheDocument();
      expect(
        screen.queryByText("Cragell, Barb Whitaker")
      ).not.toBeInTheDocument();
      userEvent.type(
        screen.getAllByTestId("date-picker-external-input")[1],
        "03/18/2021"
      );
      userEvent.tab();
      expect(await screen.findByText("Colleer, Barde X")).toBeInTheDocument();
      expect(screen.queryByText("Gerard, Sam G")).not.toBeInTheDocument();
      expect(
        screen.queryByText("Cragell, Barb Whitaker")
      ).not.toBeInTheDocument();
    });
    it("should be able to clear patient filter", async () => {
      expect(
        await screen.findByText("Test Results", { exact: false })
      ).toBeInTheDocument();

      // Apply filter
      expect(await screen.findByText("Search by name")).toBeInTheDocument();
      userEvent.type(screen.getByRole("searchbox"), "Cragell");
      expect(await screen.findByText("Filter")).toBeInTheDocument();
      userEvent.click(screen.getByText("Filter"));

      // Clear filter
      expect(await screen.findByText("Clear filters")).toBeInTheDocument();
      userEvent.click(screen.getByText("Clear filters"));

      // All results, filter no longer applied
      expect(
        await screen.findByText("Cragell, Barb Whitaker")
      ).toBeInTheDocument();
      expect(await screen.findByText("Colleer, Barde X")).toBeInTheDocument();
    });

    it("should be able to clear date filters", async () => {
      // Apply filter
      userEvent.type(
        screen.getAllByTestId("date-picker-external-input")[0],
        "03/18/2021"
      );

      userEvent.tab();

      // Filter applied
      expect(await screen.findByText("Colleer, Barde X")).toBeInTheDocument();
      expect(await screen.findByText("Gerard, Sam G")).toBeInTheDocument();
      expect(
        screen.queryByText("Cragell, Barb Whitaker")
      ).not.toBeInTheDocument();

      expect(
        screen.getAllByTestId("date-picker-external-input")[0]
      ).toHaveValue("03/18/2021");
      // Clear filter
      expect(await screen.findByText("Clear filters")).toBeInTheDocument();
      userEvent.click(screen.getByText("Clear filters"));

      // Filter no longer applied
      expect(
        await screen.findByText("Cragell, Barb Whitaker")
      ).toBeInTheDocument();

      // Date picker no longer displays the selected date
      expect(
        screen.getAllByTestId("date-picker-external-input")[0]
      ).toHaveValue("");
    });

    it("opens the test detail view", async () => {
      expect(await screen.findByText("Showing 1-3 of 3")).toBeInTheDocument();
      expect(
        await screen.findByText("Test Results", { exact: false })
      ).toBeInTheDocument();
      const moreActions = within(screen.getByRole("table")).getAllByRole(
        "button"
      )[0];
      userEvent.click(moreActions);
      const viewDetails = await screen.findByText("View details");
      userEvent.click(viewDetails);
      expect(screen.queryAllByText("Test details").length).toBe(2);
    });

    it("opens the email test results modal", async () => {
      expect(await screen.findByText("Showing 1-3 of 3")).toBeInTheDocument();
      expect(
        screen.getByText("Test Results", { exact: false })
      ).toBeInTheDocument();
      const moreActions = within(screen.getByRole("table")).getAllByRole(
        "button"
      )[0];
      userEvent.click(moreActions);
      const emailResult = screen.getByText("Email result");
      userEvent.click(emailResult);
      expect(screen.getByText("Email result modal")).toBeInTheDocument();
    });

    it("opens the download test results modal and shows how many rows the csv will have", async () => {
      expect(await screen.findByText("Showing 1-3 of 3")).toBeInTheDocument();
      expect(
        screen.getByText("Test Results", { exact: false })
      ).toBeInTheDocument();
      const downloadButton = screen.getByText("Download results", {
        exact: false,
      });
      userEvent.click(downloadButton);
      expect(
        screen.getByText("Download results without any filters", {
          exact: false,
        })
      ).toBeInTheDocument();
      expect(
        screen.getByText("The CSV file will include 3 rows", { exact: false })
      ).toBeInTheDocument();
    });

    it("closes the download test results modal after downloading", async () => {
      expect(await screen.findByText("Showing 1-3 of 3")).toBeInTheDocument();
      expect(
        screen.getByText("Test Results", { exact: false })
      ).toBeInTheDocument();
      const downloadButton = screen.getByText("Download results", {
        exact: false,
      });
      userEvent.click(downloadButton);
      expect(
        screen.getByText("Download results without any filters", {
          exact: false,
        })
      ).toBeInTheDocument();
      expect(
        screen.getByText("The CSV file will include 3 rows", { exact: false })
      ).toBeInTheDocument();
      const downloadButton2 = within(screen.getByRole("dialog")).getByRole(
        "button",
        {
          name: "Download results",
          exact: false,
        }
      );
      userEvent.click(downloadButton2);
      expect(
        screen.getByText("Loading...", {
          exact: false,
        })
      ).toBeInTheDocument();
      await waitForElementToBeRemoved(() =>
        screen.queryByText("Download results without any filters", {
          exact: false,
        })
      );
    });

    it("opens the download test results modal after applying filters and shows how many rows the csv will have", async () => {
      expect(await screen.findByText("Showing 1-3 of 3")).toBeInTheDocument();
      expect(
        screen.getByText("Test Results", { exact: false })
      ).toBeInTheDocument();
      userEvent.selectOptions(screen.getByLabelText("Result"), ["NEGATIVE"]);
      expect(await screen.findByText("Showing 1-2 of 2")).toBeInTheDocument();
      const downloadButton = screen.getByText("Download results", {
        exact: false,
      });
      userEvent.click(downloadButton);
      expect(
        await screen.findByText(
          "Download results with current filters applied",
          {
            exact: false,
          }
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText("The CSV file will include 2 rows", { exact: false })
      ).toBeInTheDocument();
    });

    describe("patient has no email", () => {
      it("doesnt show the button to print results", async () => {
        expect(await screen.findByText("Showing 1-3 of 3")).toBeInTheDocument();
        expect(
          screen.getByText("Test Results", { exact: false })
        ).toBeInTheDocument();
        const moreActions = within(screen.getByRole("table")).getAllByRole(
          "button"
        )[1];
        userEvent.click(moreActions);
        expect(screen.queryByText("Email result")).not.toBeInTheDocument();
      });
    });

    it("doesn't display anything if no facility is selected", async () => {
      render(
        <MemoryRouter>
          <Provider store={store}>
            <MockedProvider mocks={mocks}>
              <TestResultsList pageNumber={1} />
            </MockedProvider>
          </Provider>
        </MemoryRouter>
      );
      expect(
        await screen.findByText("No facility selected", { exact: false })
      ).toBeInTheDocument();
    });
  });
});
