import { MULTIPLEX_DISEASES, TEST_RESULTS } from "../testResults/constants";

import {
  getResultByDiseaseName,
  getResultObjByDiseaseName,
  getSortedResults,
  hasMultipleResults,
  hasPositiveFluResults,
} from "./testResults";

describe("getResultByDiseaseName", () => {
  describe("MultiplexResults", () => {
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
});

describe("getResultObjByDiseaseName", () => {
  describe("MultiplexResults", () => {
    let results: MultiplexResult[] = [
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
    let expectedResult: MultiplexResult;
    it("returns the COVID-19 result when searching by COVID-19", () => {
      expectedResult = {
        disease: { name: MULTIPLEX_DISEASES.COVID_19 },
        testResult: TEST_RESULTS.NEGATIVE,
      };
      expect(
        getResultObjByDiseaseName(results, "COVID-19" as MultiplexDisease)
      ).toEqual(expectedResult);
    });
    it("returns the Flu A result when searching by Flu A", () => {
      expectedResult = {
        disease: { name: MULTIPLEX_DISEASES.FLU_A },
        testResult: TEST_RESULTS.POSITIVE,
      };
      expect(
        getResultObjByDiseaseName(results, "Flu A" as MultiplexDisease)
      ).toEqual(expectedResult);
    });
    it("returns the Flu B result when searching by Flu B", () => {
      expectedResult = {
        disease: { name: MULTIPLEX_DISEASES.FLU_B },
        testResult: TEST_RESULTS.UNKNOWN,
      };
      expect(
        getResultObjByDiseaseName(results, "Flu B" as MultiplexDisease)
      ).toEqual(expectedResult);
    });
    it("returns null when searching for a MultiplexDisease not in the results", () => {
      results = [
        {
          disease: { name: MULTIPLEX_DISEASES.COVID_19 },
          testResult: TEST_RESULTS.NEGATIVE,
        },
      ];
      expect(
        getResultObjByDiseaseName(results, "Flu B" as MultiplexDisease)
      ).toEqual(null);
    });
  });
});

describe("getSortedResults", () => {
  describe("MultiplexResults", () => {
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

describe("hasPositiveFluResults", () => {
  describe("MultiplexResults", () => {
    let results: MultiplexResult[] = [];
    it("returns true if it contains a positive flu result", () => {
      results = [
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
          testResult: TEST_RESULTS.POSITIVE,
        },
      ];
      expect(hasPositiveFluResults(results)).toEqual(true);
    });
    it("returns false if it does not contain a flu result", () => {
      results = [
        {
          disease: { name: MULTIPLEX_DISEASES.COVID_19 },
          testResult: TEST_RESULTS.POSITIVE,
        },
      ];
      expect(hasPositiveFluResults(results)).toEqual(false);
    });
    it("returns false if it contains no results", () => {
      results = [];
      expect(hasPositiveFluResults(results)).toEqual(false);
    });
  });
});
