import { MULTIPLEX_DISEASES, TEST_RESULTS } from "../testResults/constants";

import {
  displayGuidance,
  getModifiedResultsForGuidance,
  getResultByDiseaseName,
  getSortedResults,
  hasMultipleResults,
  hasResultForDisease,
} from "./testResults";

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

describe("hasResultForDisease", () => {
  let results: MultiplexResult[] = [];
  it("returns false if it contains no results", () => {
    results = [];

    expect(hasResultForDisease(results, MULTIPLEX_DISEASES.FLU_B)).toEqual(
      false
    );
    expect(hasResultForDisease(results, MULTIPLEX_DISEASES.HIV, true)).toEqual(
      false
    );
  });
  it("returns true if it contains a matching result", () => {
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
        disease: { name: MULTIPLEX_DISEASES.HIV },
        testResult: TEST_RESULTS.NEGATIVE,
      },
    ];
    expect(hasResultForDisease(results, MULTIPLEX_DISEASES.FLU_A)).toEqual(
      true
    );
    expect(hasResultForDisease(results, MULTIPLEX_DISEASES.COVID_19)).toEqual(
      true
    );
    expect(hasResultForDisease(results, MULTIPLEX_DISEASES.HIV)).toEqual(true);
  });
  it("returns false if it does not contain a matching result", () => {
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
        disease: { name: MULTIPLEX_DISEASES.HIV },
        testResult: TEST_RESULTS.NEGATIVE,
      },
    ];
    expect(hasResultForDisease(results, MULTIPLEX_DISEASES.FLU_B)).toEqual(
      false
    );
  });
  it("returns true if it contains matching positive results", () => {
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
        disease: { name: MULTIPLEX_DISEASES.HIV },
        testResult: TEST_RESULTS.NEGATIVE,
      },
    ];
    expect(
      hasResultForDisease(results, MULTIPLEX_DISEASES.FLU_A, true)
    ).toEqual(true);
  });
  it("returns false if it contains no matching positive results", () => {
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
        disease: { name: MULTIPLEX_DISEASES.HIV },
        testResult: TEST_RESULTS.NEGATIVE,
      },
    ];
    expect(
      hasResultForDisease(results, MULTIPLEX_DISEASES.COVID_19, true)
    ).toEqual(false);
    expect(hasResultForDisease(results, MULTIPLEX_DISEASES.HIV, true)).toEqual(
      false
    );
    expect(hasResultForDisease(results, MULTIPLEX_DISEASES.RSV, true)).toEqual(
      false
    );
  });
});

describe("getModifiedResultsForGuidance", () => {
  let results: MultiplexResults = [];
  it("returns sorted test results", () => {
    results = [
      {
        disease: { name: MULTIPLEX_DISEASES.FLU_B },
        testResult: TEST_RESULTS.NEGATIVE,
      },
      {
        disease: { name: MULTIPLEX_DISEASES.HIV },
        testResult: TEST_RESULTS.POSITIVE,
      },
      {
        disease: { name: MULTIPLEX_DISEASES.RSV },
        testResult: TEST_RESULTS.NEGATIVE,
      },
      {
        disease: { name: MULTIPLEX_DISEASES.COVID_19 },
        testResult: TEST_RESULTS.UNDETERMINED,
      },
      {
        disease: { name: MULTIPLEX_DISEASES.FLU_A },
        testResult: TEST_RESULTS.POSITIVE,
      },
    ];
    const expectedResults = [
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
      {
        disease: { name: MULTIPLEX_DISEASES.HIV },
        testResult: TEST_RESULTS.POSITIVE,
      },
      {
        disease: { name: MULTIPLEX_DISEASES.RSV },
        testResult: TEST_RESULTS.NEGATIVE,
      },
    ];
    expect(getModifiedResultsForGuidance(results)).toEqual(expectedResults);
  });
  it("removes the positive flu b result if both flu results are positive", () => {
    results = [
      {
        disease: { name: MULTIPLEX_DISEASES.FLU_B },
        testResult: TEST_RESULTS.POSITIVE,
      },
      {
        disease: { name: MULTIPLEX_DISEASES.FLU_A },
        testResult: TEST_RESULTS.POSITIVE,
      },
    ];
    const expectedResults = [
      {
        disease: { name: MULTIPLEX_DISEASES.FLU_A },
        testResult: TEST_RESULTS.POSITIVE,
      },
    ];
    expect(getModifiedResultsForGuidance(results)).toEqual(expectedResults);
  });
});

describe("displayGuidance", () => {
  let results: MultiplexResults = [];
  it("returns true if it contains a covid result", () => {
    results = [
      {
        disease: { name: MULTIPLEX_DISEASES.COVID_19 },
        testResult: TEST_RESULTS.UNDETERMINED,
      },
    ];
    expect(displayGuidance(results)).toEqual(true);
  });
  it("returns true if it contains a positive Flu result", () => {
    results = [
      {
        disease: { name: MULTIPLEX_DISEASES.FLU_A },
        testResult: TEST_RESULTS.UNDETERMINED,
      },
      {
        disease: { name: MULTIPLEX_DISEASES.FLU_B },
        testResult: TEST_RESULTS.POSITIVE,
      },
    ];
    expect(displayGuidance(results)).toEqual(true);
  });
  it("returns true if it contains a positive RSV result", () => {
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
        testResult: TEST_RESULTS.POSITIVE,
      },
    ];
    expect(displayGuidance(results)).toEqual(true);
  });
  it("returns true if it contains a positive Syphilis result", () => {
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
        disease: { name: MULTIPLEX_DISEASES.SYPHILIS },
        testResult: TEST_RESULTS.POSITIVE,
      },
    ];
    expect(displayGuidance(results)).toEqual(true);
  });
  it("returns false if it contains no positive Flu or RSV result", () => {
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
    expect(displayGuidance(results)).toEqual(false);
  });
  it("returns false if it contains no positive Syphilis result", () => {
    results = [
      {
        disease: { name: MULTIPLEX_DISEASES.SYPHILIS },
        testResult: TEST_RESULTS.UNDETERMINED,
      },
    ];
    expect(displayGuidance(results)).toEqual(false);
  });
});
