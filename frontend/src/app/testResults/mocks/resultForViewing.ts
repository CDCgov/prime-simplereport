const resultForViewing = {
  dateTested: "2022-09-30T13:09:07.274Z",
  results: [
    {
      disease: {
        name: "COVID-19",
        __typename: "SupportedDisease",
      },
      testResult: "NEGATIVE",
      __typename: "MultiplexResult",
    },
  ],
  correctionStatus: "REMOVED",
  symptoms:
    '{"64531003":"false","103001002":"false","84229001":"false","68235000":"false","426000000":"false","49727002":"false","68962001":"false","422587007":"false","267036007":"false","62315008":"false","43724002":"false","36955009":"false","44169009":"false","422400008":"false","230145002":"false","25064002":"false","162397003":"false"}',
  symptomOnset: null,
  pregnancy: null,
  deviceType: {
    name: "LumiraDX",
    __typename: "DeviceType",
  },
  patient: {
    firstName: "Boban",
    middleName: null,
    lastName: "L",
    birthDate: "2021-11-17",
    __typename: "Patient",
  },
  createdBy: {
    name: {
      firstName: "Sarah",
      middleName: "Sally",
      lastName: "Samuels",
      __typename: "NameInfo",
    },
    __typename: "ApiUser",
  },
  __typename: "TestResult",
};

export default resultForViewing;
