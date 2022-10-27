const data = [
  {
    internalId: "0969da96-b211-41cd-ba61-002181f0918d",
    dateTested: "2021-03-17T19:27:23.806Z",
    results: [{ disease: { name: "COVID-19" }, testResult: "NEGATIVE" }],
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
    facility: {
      name: "Facility 1",
    },
    noSymptoms: true,
    symptoms: "{}",
    __typename: "TestResult",
  },
  {
    internalId: "7c768a5d-ef90-44cd-8050-b96dd77f51d5",
    dateTested: "2021-03-18T19:27:21.052Z",
    results: [{ disease: { name: "COVID-19" }, testResult: "NEGATIVE" }],
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
    facility: {
      name: "Facility 1",
    },
    noSymptoms: false,
    symptoms: "{}",
    __typename: "TestResult",
  },
  {
    internalId: "7c768a5d-ef90-44cd-8050-b96dd7aaa1d5",
    dateTested: "2021-03-19T19:27:21.052Z",
    results: [{ disease: { name: "COVID-19" }, testResult: "POSITIVE" }],
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
      phoneNumbers: [
        {
          type: "MOBILE",
          number: "(248) 555-1234",
          __typename: "PhoneNumber",
        },
      ],
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
    facility: {
      name: "Facility 1",
    },
    noSymptoms: false,
    symptoms: '{"someSymptom":"true"}',
    __typename: "TestResult",
  },
];
const TEST_RESULTS_COVID = {
  content: data,
  totalElements: data.length,
};

export default TEST_RESULTS_COVID;
