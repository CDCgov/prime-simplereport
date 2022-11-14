import { cloneDeep } from "lodash";

import { parseDataForCSV } from "./testResultCSV";

const data = [
  {
    facility: {
      name: "test facility",
      isDeleted: false,
    },
    dateTested: "2022-06-13T19:24:31.187Z",
    dateUpdated: "2022-03-13T19:24:31.187Z",
    results: [
      {
        disease: {
          name: "COVID-19",
        },
        testResult: "NEGATIVE",
      },
    ],
    correctionStatus: "REMOVED",
    reasonForCorrection: "DUPLICATE_TEST",
    deviceType: {
      name: "Access Bio CareStart",
      manufacturer: "Access Bio, Inc.",
      model: "CareStart COVID-19 Antigen test*",
      swabType: "258500001",
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
      telephone: "(123) 456-7890",
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
    symptoms:
      '{"64531003":"false","103001002":"false","84229001":"false","68235000":"false","426000000":"false","49727002":"false","68962001":"false","422587007":"false","267036007":"false","62315008":"false","43724002":"false","36955009":"false","44169009":"false","422400008":"false","230145002":"false","25064002":"false","162397003":"false"}',
    noSymptoms: false,
    symptomOnset: null,
  },
];

const result = [
  {
    "COVID-19 result": "Negative",
    "Device manufacturer": "Access Bio, Inc.",
    "Device model": "CareStart COVID-19 Antigen test*",
    "Device name": "Access Bio CareStart",
    "Device swab type": "258500001",
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
  },
];

describe("parseDataForCSV", () => {
  it("parses non-multiplex data", () => {
    const multiplexEnabled = false;
    expect(parseDataForCSV(data, multiplexEnabled)).toEqual(result);
  });

  it("parses multiplex data", () => {
    const multiplexData = cloneDeep(data);
    multiplexData[0]["results"].push(
      {
        disease: {
          name: "Flu A",
        },
        testResult: "NEGATIVE",
      },
      {
        disease: {
          name: "Flu B",
        },
        testResult: "NEGATIVE",
      }
    );
    const multiplexEnabled = true;
    const multiplexResult = cloneDeep(result);
    // @ts-ignore
    multiplexResult[0]["Flu A result"] = "Negative";
    // @ts-ignore
    multiplexResult[0]["Flu B result"] = "Negative";
    expect(parseDataForCSV(multiplexData, multiplexEnabled)).toEqual(
      multiplexResult
    );
  });
  it("parse data does not fail if tribalAffiliation is null", () => {
    const multiplexEnabled = false;
    expect(
      parseDataForCSV(
        [
          {
            ...data[0],
            patient: { ...data[0].patient, tribalAffiliation: null },
          },
        ],
        multiplexEnabled
      )
    ).toEqual(result);
  });
});
