const data = [
  {
    internalId: "0969da96-b211-41cd-ba61-002181f0123a",
    dateTested: "2021-04-12T12:40:33.381Z",
    results: [{ disease: { name: "COVID-19" }, testResult: "NEGATIVE" }],
    correctionStatus: "ORIGINAL",
    deviceType: {
      internalId: "8c1a8efe-8951-4f84-a4c9-dcea561d7fbb",
      name: "Abbott IDNow",
      __typename: "DeviceType",
    },
    patient: {
      internalId: "48c523e8-7c65-4047-955c-e3f65bb8123a",
      firstName: "Lewis",
      middleName: "",
      lastName: "Clarkson",
      birthDate: "1958-08-25",
      gender: "other",
      role: "VISITOR",
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
      internalId: "68c543e8-7c65-4047-955c-e3f65bb8123a",
    },
    facility: {
      name: "Facility 2",
    },
    __typename: "TestResult",
  },
];
const TEST_RESULTS_BY_FACILITY = {
  content: data,
  totalElements: data.length,
};

export default TEST_RESULTS_BY_FACILITY;
