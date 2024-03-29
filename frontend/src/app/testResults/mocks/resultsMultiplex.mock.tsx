export const correctionTestEventId = "8196628a-b0e2-4ee3-8fe7-4f85ab231a92";

const testOne = {
  id: "0969da96-b211-41cd-ba61-002181f0918d",
  dateAdded: "2021-03-17T19:27:23.806Z",
  dateTested: "2021-03-17T19:27:23.806Z",
  correctionStatus: "ORIGINAL",
  deviceType: {
    internalId: "8c1a8efe-8951-4f84-a4c9-dcea561d7fbb",
    name: "Abbott IDNow",
    __typename: "DeviceType",
  },
  patient: {
    internalId: "48c523e8-7c65-4047-955c-e3f65bb8b58b",
    firstName: "Gruff",
    middleName: "M",
    lastName: "MacGuffin",
    birthDate: "1960-11-07",
    gender: "male",
    role: "RESIDENT",
    lookupId: null,
    email: "totally.cool@email.com",
    __typename: "Patient",
  },
  createdBy: {
    nameInfo: {
      firstName: "Arthur",
      middleName: "A",
      lastName: "Admin",
    },
  },
  facility: {
    name: "Facility 1",
  },
  __typename: "Result",
};

const testTwo = {
  id: "7c768a5d-ef90-44cd-8050-b96dd77f51d5",
  dateAdded: "2021-03-17T19:27:23.806Z",
  dateTested: "2021-03-18T19:27:21.052Z",
  correctionStatus: "ORIGINAL",
  deviceType: {
    internalId: "8c1a8efe-8951-4f84-a4c9-dcea561d7fbb",
    name: "Abbott IDNow",
    __typename: "DeviceType",
  },
  patient: {
    internalId: "f74ad245-3a69-44b5-bb6d-efe06308bb85",
    firstName: "Braisley",
    middleName: "R",
    lastName: "Adams",
    birthDate: "1960-11-07",
    gender: "female",
    role: "STAFF",
    lookupId: null,
    phoneNumbers: [
      {
        type: "MOBILE",
        number: "2708675309",
      },
    ],
    __typename: "Patient",
  },
  createdBy: {
    nameInfo: {
      firstName: "Ursula",
      middleName: "",
      lastName: "User",
    },
  },
  facility: {
    name: "Facility 1",
  },
  __typename: "Result",
};

const testThree = {
  id: "a80e3bc5-32ef-406d-b84a-84b5cc6e4b58",
  dateAdded: "2021-03-17T19:27:23.806Z",
  dateTested: "2021-03-19T19:27:21.052Z",
  correctionStatus: "ORIGINAL",
  deviceType: {
    internalId: "8c1a8efe-8951-4f84-a4c9-dcea561d7fbb",
    name: "Abbott IDNow",
    __typename: "DeviceType",
  },
  patient: {
    internalId: "f74ad245-3a69-44b5-bb6d-efe06308bb85",
    firstName: "Rupert",
    middleName: "G",
    lastName: "Purrington",
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
  facility: {
    name: "Facility 1",
  },
  __typename: "Result",
};

const data = [
  {
    ...testOne,
    disease: "COVID-19",
    testResult: "NEGATIVE",
  },
  {
    ...testOne,
    disease: "Flu A",
    testResult: "POSITIVE",
  },
  {
    ...testOne,
    disease: "Flu B",
    testResult: "NEGATIVE",
  },
  {
    ...testTwo,
    disease: "COVID-19",
    testResult: "NEGATIVE",
  },
  {
    ...testTwo,
    disease: "Flu A",
    testResult: "NEGATIVE",
  },
  {
    ...testTwo,
    disease: "Flu B",
    testResult: "POSITIVE",
  },
  {
    ...testThree,
    disease: "COVID-19",
    testResult: "POSITIVE",
  },
  {
    ...testThree,
    disease: "Flu A",
    testResult: "POSITIVE",
  },
  {
    ...testThree,
    id: correctionTestEventId,
    disease: "COVID-19",
    testResult: "POSITIVE",
    correctionStatus: "CORRECTED",
  },
];

const TEST_RESULTS_MULTIPLEX = {
  content: data,
  totalElements: data.length,
};

export default TEST_RESULTS_MULTIPLEX;
