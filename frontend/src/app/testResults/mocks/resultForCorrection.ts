const resultForCorrection = {
  dateTested: "2022-09-28T19:18:06.026Z",
  results: [
    {
      disease: {
        name: "COVID-19",
        __typename: "SupportedDisease",
      },
      testResult: "POSITIVE",
      __typename: "MultiplexResult",
    },
  ],
  correctionStatus: "ORIGINAL",
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
  __typename: "TestResult",
};
export default resultForCorrection;
