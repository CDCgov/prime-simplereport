import { MULTIPLEX_DISEASES, TEST_RESULTS } from "../testResults/constants";
import CovidResultGuidance from "../commonComponents/TestResultGuidance/CovidResultGuidance";
import FluResultGuidance from "../commonComponents/TestResultGuidance/FluResultGuidance";
import RsvResultGuidance from "../commonComponents/TestResultGuidance/RsvResultGuidance";
import SyphilisResultGuidance from "../commonComponents/TestResultGuidance/SyphilisResultGuidance";

import {
  getGuidanceForResults,
  getResultByDiseaseName,
  getResultForDisease,
  getSortedResults,
  hasMultipleResults,
} from "./testResults";

jest.mock("react-i18next", () => ({
  useTranslation: () => {
    return {
      t: (str: string) => str,
    };
  },
}));

describe("getResultByDiseaseName", () => {
  let result: string;
  const results: MultiplexResult[] = [
    {
      disease: { name: MULTIPLEX_DISEASES.COVID_19 },
      testResult: TEST_RESULTS.UNDETERMINED,
    },
    {
      disease: { name: MULTIPLEX_DISEASES.FLU_A },
      testResult: TEST_RESULTS.POSITIVE,
    },
    {
      disease: { name: MULTIPLEX_DISEASES.FLU_B },
      testResult: TEST_RESULTS.NEGATIVE,
    },
  ];
  const covidResults: MultiplexResult[] = [
    {
      disease: { name: MULTIPLEX_DISEASES.COVID_19 },
      testResult: TEST_RESULTS.UNDETERMINED,
    },
  ];
  it("returns UNDETERMINED if selecting COVID-19", () => {
    result = "UNDETERMINED";
    expect(getResultByDiseaseName(results, "COVID-19")).toEqual(result);
  });
  it("returns POSITIVE if selecting Flu A", () => {
    result = "POSITIVE";
    expect(getResultByDiseaseName(results, "Flu A")).toEqual(result);
  });
  it("returns NEGATIVE if selecting Flu B", () => {
    result = "NEGATIVE";
    expect(getResultByDiseaseName(results, "Flu B")).toEqual(result);
  });
  it("returns UNKNOWN if selecting a DiseaseName that is not present", () => {
    result = "UNKNOWN";
    expect(getResultByDiseaseName(covidResults, "Flu B")).toEqual(result);
  });
});

describe("getSortedResults", () => {
  let results: MultiplexResult[] = [
    {
      disease: { name: MULTIPLEX_DISEASES.FLU_B },
      testResult: TEST_RESULTS.UNKNOWN,
    },
    {
      disease: { name: MULTIPLEX_DISEASES.COVID_19 },
      testResult: TEST_RESULTS.NEGATIVE,
    },
    {
      disease: { name: MULTIPLEX_DISEASES.FLU_A },
      testResult: TEST_RESULTS.POSITIVE,
    },
  ];
  let expectedResults: MultiplexResults;
  it("returns the result in ABC order by disease name", () => {
    expectedResults = [
      {
        disease: { name: MULTIPLEX_DISEASES.COVID_19 },
        testResult: TEST_RESULTS.NEGATIVE,
      },
      {
        disease: { name: MULTIPLEX_DISEASES.FLU_A },
        testResult: TEST_RESULTS.POSITIVE,
      },
      {
        disease: { name: MULTIPLEX_DISEASES.FLU_B },
        testResult: TEST_RESULTS.UNKNOWN,
      },
    ];
    expect(getSortedResults(results)).toEqual(expectedResults);
  });
  it("returns the same array when only one result", () => {
    let results: MultiplexResult[] = [
      {
        disease: { name: MULTIPLEX_DISEASES.FLU_B },
        testResult: TEST_RESULTS.UNKNOWN,
      },
    ];
    expect(getSortedResults(results)).toEqual(results);
  });
});

describe("hasMultipleResults", () => {
  let results: MultiplexResult[] = [];
  it("returns true if it contains multiple results", () => {
    results = [
      {
        disease: { name: MULTIPLEX_DISEASES.COVID_19 },
        testResult: TEST_RESULTS.NEGATIVE,
      },
      {
        disease: { name: MULTIPLEX_DISEASES.FLU_A },
        testResult: TEST_RESULTS.POSITIVE,
      },
      {
        disease: { name: MULTIPLEX_DISEASES.FLU_B },
        testResult: TEST_RESULTS.POSITIVE,
      },
    ];
    expect(hasMultipleResults(results)).toEqual(true);
  });
  it("returns false if it only contains one result", () => {
    results = [
      {
        disease: { name: MULTIPLEX_DISEASES.COVID_19 },
        testResult: TEST_RESULTS.NEGATIVE,
      },
    ];
    expect(hasMultipleResults(results)).toEqual(false);
  });
  it("returns false if has no results", () => {
    results = [];
    expect(hasMultipleResults(results)).toEqual(false);
  });
});

describe("getResultForDisease", () => {
  let results: MultiplexResult[] = [];
  const covidResult: MultiplexResult = {
    disease: { name: MULTIPLEX_DISEASES.COVID_19 },
    testResult: TEST_RESULTS.UNDETERMINED,
  };
  const fluResult: MultiplexResult = {
    disease: { name: MULTIPLEX_DISEASES.FLU_A },
    testResult: TEST_RESULTS.POSITIVE,
  };
  const hivResult: MultiplexResult = {
    disease: { name: MULTIPLEX_DISEASES.HIV },
    testResult: TEST_RESULTS.NEGATIVE,
  };

  it("returns undefined if it contains no results", () => {
    results = [];

    expect(getResultForDisease(results, MULTIPLEX_DISEASES.FLU_B)).toEqual(
      undefined
    );
    expect(getResultForDisease(results, MULTIPLEX_DISEASES.HIV, true)).toEqual(
      undefined
    );
  });
  it("returns a matching result", () => {
    results = [covidResult, fluResult, hivResult];
    expect(getResultForDisease(results, MULTIPLEX_DISEASES.FLU_A)).toEqual(
      fluResult
    );
    expect(getResultForDisease(results, MULTIPLEX_DISEASES.COVID_19)).toEqual(
      covidResult
    );
    expect(getResultForDisease(results, MULTIPLEX_DISEASES.HIV)).toEqual(
      hivResult
    );
  });
  it("returns undefined if it does not contain a matching result", () => {
    results = [covidResult, fluResult, hivResult];
    expect(getResultForDisease(results, MULTIPLEX_DISEASES.FLU_B)).toEqual(
      undefined
    );
  });
  it("returns true if it contains matching positive results", () => {
    results = [covidResult, fluResult, hivResult];
    expect(
      getResultForDisease(results, MULTIPLEX_DISEASES.FLU_A, true)
    ).toEqual(fluResult);
  });
  it("returns undefined if it contains no matching positive results", () => {
    results = [covidResult, fluResult, hivResult];
    expect(
      getResultForDisease(results, MULTIPLEX_DISEASES.COVID_19, true)
    ).toEqual(undefined);
    expect(getResultForDisease(results, MULTIPLEX_DISEASES.HIV, true)).toEqual(
      undefined
    );
    expect(getResultForDisease(results, MULTIPLEX_DISEASES.RSV, true)).toEqual(
      undefined
    );
  });
});

describe("getGuidanceForResults", () => {
  let results: MultiplexResults = [];

  it("returns Covid element if it contains a covid result", () => {
    const covidResult: MultiplexResult = {
      disease: { name: MULTIPLEX_DISEASES.COVID_19 },
      testResult: TEST_RESULTS.UNDETERMINED,
    };
    results = [covidResult];
    const expectedGuidance = [
      CovidResultGuidance({ result: covidResult, isPatientApp: true }),
    ];
    expect(getGuidanceForResults(results, true)).toEqual(expectedGuidance);
  });
  it("returns flu element if it contains a positive Flu result", () => {
    const fluBResult = {
      disease: { name: MULTIPLEX_DISEASES.FLU_B },
      testResult: TEST_RESULTS.POSITIVE,
    };
    results = [
      {
        disease: { name: MULTIPLEX_DISEASES.FLU_A },
        testResult: TEST_RESULTS.UNDETERMINED,
      },
      fluBResult,
    ];
    const expectedGuidance = [FluResultGuidance({ result: fluBResult })];
    expect(getGuidanceForResults(results, true)).toEqual(expectedGuidance);
  });
  it("returns flu element if it contains a positive Flu A & B result", () => {
    const fluABResult = {
      disease: { name: MULTIPLEX_DISEASES.FLU_A_AND_B },
      testResult: TEST_RESULTS.POSITIVE,
    };
    results = [
      {
        disease: { name: MULTIPLEX_DISEASES.RSV },
        testResult: TEST_RESULTS.UNDETERMINED,
      },
      fluABResult,
    ];
    const expectedGuidance = [FluResultGuidance({ result: fluABResult })];
    expect(getGuidanceForResults(results, true)).toEqual(expectedGuidance);
  });
  it("returns single flu element if it contains multiple positive Flu results", () => {
    const fluBResult = {
      disease: { name: MULTIPLEX_DISEASES.FLU_B },
      testResult: TEST_RESULTS.POSITIVE,
    };
    results = [
      fluBResult,
      {
        disease: { name: MULTIPLEX_DISEASES.FLU_A },
        testResult: TEST_RESULTS.POSITIVE,
      },
    ];
    const expectedGuidance = [FluResultGuidance({ result: fluBResult })];
    expect(getGuidanceForResults(results, true)).toEqual(expectedGuidance);
  });
  it("returns multiple elements if multiple matching results", () => {
    const fluBResult = {
      disease: { name: MULTIPLEX_DISEASES.FLU_B },
      testResult: TEST_RESULTS.POSITIVE,
    };
    const rsvResult = {
      disease: { name: MULTIPLEX_DISEASES.RSV },
      testResult: TEST_RESULTS.POSITIVE,
    };
    results = [
      fluBResult,
      {
        disease: { name: MULTIPLEX_DISEASES.FLU_A },
        testResult: TEST_RESULTS.POSITIVE,
      },
      rsvResult,
    ];
    const expectedGuidance = [
      FluResultGuidance({ result: fluBResult }),
      RsvResultGuidance({ result: rsvResult }),
    ];
    expect(getGuidanceForResults(results, true)).toEqual(expectedGuidance);
  });
  it("returns RSV element if it contains a positive RSV result", () => {
    const rsvResult = {
      disease: { name: MULTIPLEX_DISEASES.RSV },
      testResult: TEST_RESULTS.POSITIVE,
    };
    results = [
      {
        disease: { name: MULTIPLEX_DISEASES.FLU_A },
        testResult: TEST_RESULTS.UNDETERMINED,
      },
      {
        disease: { name: MULTIPLEX_DISEASES.FLU_B },
        testResult: TEST_RESULTS.NEGATIVE,
      },
      rsvResult,
    ];
    const expectedGuidance = [RsvResultGuidance({ result: rsvResult })];
    expect(getGuidanceForResults(results, false)).toEqual(expectedGuidance);
  });
  it("returns Syphilis element if it contains a positive Syphilis result", () => {
    const syphilisResult = {
      disease: { name: MULTIPLEX_DISEASES.SYPHILIS },
      testResult: TEST_RESULTS.POSITIVE,
    };
    results = [
      {
        disease: { name: MULTIPLEX_DISEASES.FLU_A },
        testResult: TEST_RESULTS.UNDETERMINED,
      },
      {
        disease: { name: MULTIPLEX_DISEASES.FLU_B },
        testResult: TEST_RESULTS.NEGATIVE,
      },
      syphilisResult,
    ];
    const expectedGuidance = [
      SyphilisResultGuidance({ result: syphilisResult }),
    ];
    expect(getGuidanceForResults(results, false)).toEqual(expectedGuidance);
  });
  it("returns empty if it contains no positive Flu or RSV result", () => {
    results = [
      {
        disease: { name: MULTIPLEX_DISEASES.FLU_A },
        testResult: TEST_RESULTS.UNDETERMINED,
      },
      {
        disease: { name: MULTIPLEX_DISEASES.FLU_B },
        testResult: TEST_RESULTS.NEGATIVE,
      },
      {
        disease: { name: MULTIPLEX_DISEASES.RSV },
        testResult: TEST_RESULTS.NEGATIVE,
      },
    ];
    expect(getGuidanceForResults(results, true)).toEqual([]);
  });
  it("returns false if it contains no positive Syphilis result", () => {
    results = [
      {
        disease: { name: MULTIPLEX_DISEASES.SYPHILIS },
        testResult: TEST_RESULTS.UNDETERMINED,
      },
    ];
    expect(getGuidanceForResults(results, false)).toEqual([]);
  });
});
