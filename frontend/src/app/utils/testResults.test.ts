import {
  getResultByDiseaseName,
  getResultObjByDiseaseName,
  getSortedResults,
  hasMultiplexResults,
  hasPositiveFluResults,
} from "./testResults";

describe("getResultByDiseaseName", () => {
  describe("SimpleReportResults", () => {
    let result: string;
    const results: SRMultiplexResult[] = [
      { disease: { name: "COVID-19" }, testResult: "UNDETERMINED" },
      { disease: { name: "Flu A" }, testResult: "POSITIVE" },
      { disease: { name: "Flu B" }, testResult: "NEGATIVE" },
    ];
    const covidResults: SRMultiplexResult[] = [
      { disease: { name: "COVID-19" }, testResult: "UNDETERMINED" },
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
  describe("PxpResults", () => {
    let result: string;
    const results: PxpMultiplexResult[] = [
      { disease: { name: "COVID-19" }, result: "UNDETERMINED" },
      { disease: { name: "Flu A" }, result: "POSITIVE" },
      { disease: { name: "Flu B" }, result: "NEGATIVE" },
    ];
    const covidResults: PxpMultiplexResult[] = [
      { disease: { name: "COVID-19" }, result: "UNDETERMINED" },
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
  describe("SimpleReportResults", () => {
    let results: SRMultiplexResult[] = [
      { disease: { name: "COVID-19" }, testResult: "NEGATIVE" },
      { disease: { name: "Flu A" }, testResult: "POSITIVE" },
      { disease: { name: "Flu B" }, testResult: "UNKNOWN" },
    ];
    let expectedResult: MultiplexResult;
    it("returns the COVID-19 result when searching by COVID-19", () => {
      expectedResult = {
        disease: { name: "COVID-19" },
        testResult: "NEGATIVE",
      };
      expect(
        getResultObjByDiseaseName(results, "COVID-19" as MultiplexDisease)
      ).toEqual(expectedResult);
    });
    it("returns the Flu A result when searching by Flu A", () => {
      expectedResult = { disease: { name: "Flu A" }, testResult: "POSITIVE" };
      expect(
        getResultObjByDiseaseName(results, "Flu A" as MultiplexDisease)
      ).toEqual(expectedResult);
    });
    it("returns the Flu B result when searching by Flu B", () => {
      expectedResult = { disease: { name: "Flu B" }, testResult: "UNKNOWN" };
      expect(
        getResultObjByDiseaseName(results, "Flu B" as MultiplexDisease)
      ).toEqual(expectedResult);
    });
    it("returns null when searching for a MultiplexDisease not in the results", () => {
      results = [{ disease: { name: "COVID-19" }, testResult: "NEGATIVE" }];
      expect(
        getResultObjByDiseaseName(results, "Flu B" as MultiplexDisease)
      ).toEqual(null);
    });
  });
  describe("PxpResults", () => {
    let results: PxpMultiplexResult[] = [
      { disease: { name: "COVID-19" }, result: "NEGATIVE" },
      { disease: { name: "Flu A" }, result: "POSITIVE" },
      { disease: { name: "Flu B" }, result: "UNKNOWN" },
    ];
    let expectedResult: MultiplexResult;
    it("returns the COVID-19 result when searching by COVID-19", () => {
      expectedResult = {
        disease: { name: "COVID-19" },
        result: "NEGATIVE",
      };
      expect(
        getResultObjByDiseaseName(results, "COVID-19" as MultiplexDisease)
      ).toEqual(expectedResult);
    });
    it("returns the Flu A result when searching by Flu A", () => {
      expectedResult = { disease: { name: "Flu A" }, result: "POSITIVE" };
      expect(
        getResultObjByDiseaseName(results, "Flu A" as MultiplexDisease)
      ).toEqual(expectedResult);
    });
    it("returns the Flu B result when searching by Flu B", () => {
      expectedResult = { disease: { name: "Flu B" }, result: "UNKNOWN" };
      expect(
        getResultObjByDiseaseName(results, "Flu B" as MultiplexDisease)
      ).toEqual(expectedResult);
    });
    it("returns null when searching for a MultiplexDisease not in the results", () => {
      results = [{ disease: { name: "COVID-19" }, result: "NEGATIVE" }];
      expect(
        getResultObjByDiseaseName(results, "Flu B" as MultiplexDisease)
      ).toEqual(null);
    });
  });
});

describe("getSortedResults", () => {
  describe("SimpleReportResults", () => {
    let results: SRMultiplexResult[] = [
      { disease: { name: "Flu B" }, testResult: "UNKNOWN" },
      { disease: { name: "COVID-19" }, testResult: "NEGATIVE" },
      { disease: { name: "Flu A" }, testResult: "POSITIVE" },
    ];
    let expectedResults: MultiplexResults;
    it("returns the result in ABC order by disease name", () => {
      expectedResults = [
        { disease: { name: "COVID-19" }, testResult: "NEGATIVE" },
        { disease: { name: "Flu A" }, testResult: "POSITIVE" },
        { disease: { name: "Flu B" }, testResult: "UNKNOWN" },
      ];
      expect(getSortedResults(results)).toEqual(expectedResults);
    });
    it("returns the same array when only one result", () => {
      let results: SRMultiplexResult[] = [
        { disease: { name: "Flu B" }, testResult: "UNKNOWN" },
      ];
      expect(getSortedResults(results)).toEqual(results);
    });
  });
  describe("PxpResults", () => {
    let results: PxpMultiplexResult[] = [
      { disease: { name: "Flu B" }, result: "UNKNOWN" },
      { disease: { name: "COVID-19" }, result: "NEGATIVE" },
      { disease: { name: "Flu A" }, result: "POSITIVE" },
    ];
    let expectedResults: MultiplexResults;
    it("returns the result in ABC order by disease name", () => {
      expectedResults = [
        { disease: { name: "COVID-19" }, result: "NEGATIVE" },
        { disease: { name: "Flu A" }, result: "POSITIVE" },
        { disease: { name: "Flu B" }, result: "UNKNOWN" },
      ];
      expect(getSortedResults(results)).toEqual(expectedResults);
    });
    it("returns the same array when only one result", () => {
      let results: PxpMultiplexResult[] = [
        { disease: { name: "Flu B" }, result: "UNKNOWN" },
      ];
      expect(getSortedResults(results)).toEqual(results);
    });
  });
});

describe("hasMultiplexResults", () => {
  describe("SimpleReportResults", () => {
    let results: SRMultiplexResult[] = [];
    it("returns true if it contains a multiplex result", () => {
      results = [
        { disease: { name: "COVID-19" }, testResult: "NEGATIVE" },
        { disease: { name: "Flu A" }, testResult: "POSITIVE" },
        { disease: { name: "Flu B" }, testResult: "POSITIVE" },
      ];
      expect(hasMultiplexResults(results)).toEqual(true);
    });
    it("returns false if it only contains one result", () => {
      results = [{ disease: { name: "COVID-19" }, testResult: "NEGATIVE" }];
      expect(hasMultiplexResults(results)).toEqual(false);
    });
    it("returns false if has no results", () => {
      results = [];
      expect(hasMultiplexResults(results)).toEqual(false);
    });
  });
  describe("PxpResults", () => {
    let results: PxpMultiplexResult[] = [];
    it("returns true if it contains a multiplex result", () => {
      results = [
        { disease: { name: "COVID-19" }, result: "NEGATIVE" },
        { disease: { name: "Flu A" }, result: "POSITIVE" },
        { disease: { name: "Flu B" }, result: "POSITIVE" },
      ];
      expect(hasMultiplexResults(results)).toEqual(true);
    });
    it("returns false if it only contains one result", () => {
      results = [{ disease: { name: "COVID-19" }, result: "NEGATIVE" }];
      expect(hasMultiplexResults(results)).toEqual(false);
    });
    it("returns false if it contains no results", () => {
      results = [];
      expect(hasMultiplexResults(results)).toEqual(false);
    });
  });
});

describe("hasPositiveFluResults", () => {
  describe("SimpleReportResults", () => {
    let results: SRMultiplexResult[] = [];
    it("returns true if it contains a positive flu result", () => {
      results = [
        { disease: { name: "COVID-19" }, testResult: "NEGATIVE" },
        { disease: { name: "Flu A" }, testResult: "POSITIVE" },
        { disease: { name: "Flu B" }, testResult: "POSITIVE" },
      ];
      expect(hasPositiveFluResults(results)).toEqual(true);
    });
    it("returns false if it does not contain a flu result", () => {
      results = [{ disease: { name: "COVID-19" }, testResult: "POSITIVE" }];
      expect(hasPositiveFluResults(results)).toEqual(false);
    });
    it("returns false if it has no results", () => {
      results = [];
      expect(hasMultiplexResults(results)).toEqual(false);
    });
  });
  describe("PxpResults", () => {
    let results: PxpMultiplexResult[] = [];
    it("returns true if it contains a positive flu result", () => {
      results = [
        { disease: { name: "COVID-19" }, result: "UNDETERMINED" },
        { disease: { name: "Flu A" }, result: "POSITIVE" },
        { disease: { name: "Flu B" }, result: "POSITIVE" },
      ];
      expect(hasPositiveFluResults(results)).toEqual(true);
    });
    it("returns false if it does not contain a flu result", () => {
      results = [{ disease: { name: "COVID-19" }, result: "NEGATIVE" }];
      expect(hasPositiveFluResults(results)).toEqual(false);
    });
    it("returns false if it contains no results", () => {
      results = [];
      expect(hasPositiveFluResults(results)).toEqual(false);
    });
  });
});
