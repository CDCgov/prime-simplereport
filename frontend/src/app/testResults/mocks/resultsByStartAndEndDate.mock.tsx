const data = [
  {
    internalId: "7c768a5d-ef90-44cd-8050-b96dd77f51d5",
    dateTested: "2021-03-18T19:27:21.052Z",
    disease: "COVID-19",
    testResult: "NEGATIVE",
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
    facility: {
      name: "Facility 1",
      isDeleted: false,
    },
    noSymptoms: false,
    symptoms: "{}",
    __typename: "Result",
  },
];

const TEST_RESULTS_BY_START_END_DATE = {
  content: data,
  totalElements: data.length,
};

export default TEST_RESULTS_BY_START_END_DATE;
