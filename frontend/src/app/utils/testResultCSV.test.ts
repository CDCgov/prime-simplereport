import { parseDataForCSV, QueriedTestResult } from "./testResultCSV";

const genericTestResult: Partial<QueriedTestResult> = {
  facility: {
    name: "test facility",
    isDeleted: false,
  },
  dateTested: "2022-06-13T19:24:31.187Z",
  dateUpdated: "2022-03-13T19:24:31.187Z",
  dateAdded: "2022-03-13T19:24:31.187Z",
  correctionStatus: "REMOVED",
  reasonForCorrection: "DUPLICATE_TEST",
  deviceType: {
    name: "Access Bio CareStart",
    manufacturer: "Access Bio, Inc.",
    model: "CareStart COVID-19 Antigen test*",
    swabTypes: [
      {
        internalId: "2f5188b9-1e91-49cc-b004-340689e846e9",
        name: "Nasal swab",
      },
    ],
  },
  patient: {
    firstName: "John",
    middleName: "E",
    lastName: "Doe",
    birthDate: "1980-01-01",
    gender: "female",
    race: "white",
    ethnicity: "hispanic",
    tribalAffiliation: [null],
    lookupId: null,
    phoneNumbers: [
      {
        number: "(123) 456-7890",
      },
    ],
    email: "foo@bar.com",
    street: "1234 Green Street",
    streetTwo: "",
    city: "Minneapolis",
    county: null,
    state: "MN",
    zipCode: "90210",
    country: "USA",
    role: "STAFF",
    residentCongregateSetting: null,
    employedInHealthcare: null,
    preferredLanguage: "English",
  },
  createdBy: {
    nameInfo: {
      firstName: "Jane",
      middleName: null,
      lastName: "Doe",
    },
  },
  surveyData: {
    symptoms:
      '{"64531003":"false","103001002":"false","84229001":"false","68235000":"false","426000000":"false","49727002":"false","68962001":"false","422587007":"false","267036007":"false","62315008":"false","43724002":"false","36955009":"false","44169009":"false","422400008":"false","230145002":"false","25064002":"false","162397003":"false"}',
    noSymptoms: false,
    symptomOnset: null,
  },
};

const data: QueriedTestResult[] = [
  {
    ...genericTestResult,
    id: "551150c4-8e48-4cb6-a2fa-74c52b8ca96f",
    disease: "COVID-19",
    testResult: "NEGATIVE",
  },
  {
    ...genericTestResult,
    id: "53d59cbf-133d-46be-9bc2-751a9e935a06",
    disease: "Flu A",
    testResult: "NEGATIVE",
  },
  {
    ...genericTestResult,
    id: "6a92fef7-97f3-4929-9904-4d22d781e7f6",
    disease: "Flu B",
    testResult: "NEGATIVE",
  },
  {
    ...genericTestResult,
    id: "72b26d81-860c-4394-8de5-f30aa91b79d7",
    disease: "RSV",
    testResult: "UNDETERMINED",
  },
  {
    ...genericTestResult,
    id: "398e85b1-9355-41cd-a1ca-ce95f7dc2a01",
    disease: "HIV",
    testResult: "POSITIVE",
  },
  {
    ...genericTestResult,
    id: "d4b23feb-96e3-4a88-bb63-699a865aaa3c",
    disease: "Syphilis",
    testResult: "POSITIVE",
  },
] as QueriedTestResult[];

const csvRowWithoutResult = {
  "Device manufacturer": "Access Bio, Inc.",
  "Device model": "CareStart COVID-19 Antigen test*",
  "Device name": "Access Bio CareStart",
  "Device swab type": "Nasal swab",
  "Facility name": "test facility",
  "Has symptoms": "Unknown",
  "Patient ID (Student ID, Employee ID, etc.)": null,
  "Patient city": "Minneapolis",
  "Patient country": "USA",
  "Patient county": null,
  "Patient date of birth": "01/01/1980",
  "Patient email": "foo@bar.com",
  "Patient ethnicity": "hispanic",
  "Patient first name": "John",
  "Patient full name": "Doe, John E",
  "Patient gender": "female",
  "Patient is a resident in a congregate setting": null,
  "Patient is employed in healthcare": null,
  "Patient last name": "Doe",
  "Patient middle name": "E",
  "Patient phone number": "(123) 456-7890",
  "Patient preferred language": "English",
  "Patient race": "white",
  "Patient role": "STAFF",
  "Patient state": "MN",
  "Patient street address": "1234 Green Street",
  "Patient street address 2": "",
  "Patient tribal affiliation": "",
  "Patient zip code": "90210",
  "Result reported date": "03/13/2022 7:24pm",
  Submitter: "Doe, Jane",
  "Symptom onset": "Invalid date",
  "Symptoms present": "No symptoms",
  "Test correction reason": "DUPLICATE_TEST",
  "Test correction status": "REMOVED",
  "Test date": "06/13/2022 7:24pm",
};

const covidResultRow = {
  ...csvRowWithoutResult,
  Condition: "COVID-19",
  Result: "NEGATIVE",
};

const csvResultRows = [
  {
    ...covidResultRow,
  },
  {
    ...csvRowWithoutResult,
    Condition: "Flu A",
    Result: "NEGATIVE",
  },
  {
    ...csvRowWithoutResult,
    Condition: "Flu B",
    Result: "NEGATIVE",
  },
  {
    ...csvRowWithoutResult,
    Condition: "RSV",
    Result: "UNDETERMINED",
  },
  {
    ...csvRowWithoutResult,
    Condition: "HIV",
    Result: "POSITIVE",
  },
  {
    ...csvRowWithoutResult,
    Condition: "Syphilis",
    Result: "POSITIVE",
  },
];

describe("parseDataForCSV", () => {
  it("parses multiplex data", () => {
    expect(parseDataForCSV(data)).toEqual(csvResultRows);
  });
  it("parse data does not fail if tribalAffiliation is null", () => {
    expect(
      parseDataForCSV([
        {
          ...data[0]!,
          patient: { ...data[0]?.patient, tribalAffiliation: null },
        },
      ])
    ).toEqual([covidResultRow]);
  });
});
