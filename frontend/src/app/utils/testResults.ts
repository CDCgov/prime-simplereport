function getTestResult(result: MultiplexResult): TestResult {
  if (result) {
    if ("testResult" in result) {
      return result.testResult;
    }
  }
  return "UNKNOWN";
}

export function getResultObjByDiseaseName(
  results: MultiplexResults,
  diseaseName: MultiplexDisease
): MultiplexResult {
  return (
    (results.find((result: MultiplexResult) => {
      return result.disease.name.includes(diseaseName);
    }) as MultiplexResult) || null
  );
}

export function getResultByDiseaseName(
  results: MultiplexResults,
  diseaseName: MultiplexDisease
): string {
  const result = getResultObjByDiseaseName(results, diseaseName);
  return getTestResult(result) || "UNKNOWN";
}

export function getSortedResults(results: MultiplexResults): MultiplexResults {
  return Object.values(results).sort(
    (a: MultiplexResult, b: MultiplexResult) => {
      return a.disease.name.localeCompare(b.disease.name);
    }
  );
}

export function hasMultiplexResults(results: MultiplexResults): boolean {
  return results?.length > 1
    ? results.some(
        (result: MultiplexResult) => result.disease?.name !== "COVID-19"
      )
    : false;
}

export function hasPositiveFluResults(results: MultiplexResults): boolean {
  return (
    results.filter(
      (multiplexResult: MultiplexResult) =>
        multiplexResult.disease.name.includes("Flu") &&
        getTestResult(multiplexResult) === "POSITIVE"
    ).length > 0
  );
}

export function hasCovidResults(results: MultiplexResults): boolean {
  return (
    results.filter((multiplexResult: MultiplexResult) =>
      multiplexResult.disease.name.includes("COVID-19")
    ).length > 0
  );
}

export function hasPositiveRsvResults(results: MultiplexResults): boolean {
  return (
    results.filter(
      (multiplexResult: MultiplexResult) =>
        multiplexResult.disease.name.includes("RSV") &&
        getTestResult(multiplexResult) === "POSITIVE"
    ).length > 0
  );
}
