const data = [
  {
    id: "0969da96-b211-41cd-ba61-002181f0918d",
    dateAdded: "2021-03-17T19:27:23.806Z",
    dateTested: "2021-03-17T19:27:23.806Z",
    disease: "COVID-19",
    testResult: "NEGATIVE",
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
    facility: {
      name: "Facility 1",
      isDeleted: false,
    },
    noSymptoms: true,
    symptoms: "{}",
    __typename: "Result",
  },
  {
    id: "7c768a5d-ef90-44cd-8050-b96dd7aaa1d5",
    dateAdded: "2021-03-17T19:27:23.806Z",
    dateTested: "2021-03-19T19:27:21.052Z",
    disease: "COVID-19",
    testResult: "POSITIVE",
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
    facility: {
      name: "Facility 1",
      isDeleted: false,
    },
    noSymptoms: false,
    symptoms: '{"someSymptom":"true"}',
    __typename: "Result",
  },
];

const TEST_RESULTS_BY_ROLE = {
  content: data,
  totalElements: data.length,
};
export default TEST_RESULTS_BY_ROLE;
