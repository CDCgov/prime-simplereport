import { MULTIPLEX_DISEASES, TEST_RESULTS } from "../testResults/constants";
import { MultiplexResultInput } from "../../generated/graphql";

export function getResultByDiseaseName(
  results: MultiplexResults,
  diseaseName: MultiplexDisease
): string;
export function getResultByDiseaseName(
  results: MultiplexResultInput[],
  diseaseName: MULTIPLEX_DISEASES
): string;
export function getResultByDiseaseName(
  results: MultiplexResults | MultiplexResultInput[],
  diseaseName: MultiplexDisease | MULTIPLEX_DISEASES
): string {
  const matchedResult = results.find((r) => {
    if (isMultiplexInput(r)) {
      return r.diseaseName === diseaseName;
    } else {
      return r.disease.name.includes(diseaseName);
    }
  });

  if (matchedResult === undefined) return "UNKNOWN";
  return matchedResult.testResult;
}

function isMultiplexInput(
  result: MultiplexResult | MultiplexResultInput
): result is MultiplexResultInput {
  return (result as MultiplexResultInput).diseaseName !== undefined;
}

export function getSortedResults(results: MultiplexResults): MultiplexResults {
  return Object.values(results).sort(
    (a: MultiplexResult, b: MultiplexResult) => {
      return a.disease.name.localeCompare(b.disease.name);
    }
  );
}

export function hasMultipleResults(results: MultiplexResults): boolean {
  return results?.length > 1;
}

export function hasResultForDisease(
  results: MultiplexResults | null | undefined,
  diseaseName: MultiplexDisease,
  positivesOnly: boolean = false
): boolean {
  if (!results) {
    return false;
  }
  return (
    results.filter(
      (multiplexResult: MultiplexResult) =>
        multiplexResult.disease.name === diseaseName &&
        (!positivesOnly || multiplexResult.testResult === TEST_RESULTS.POSITIVE)
    ).length > 0
  );
}

export const getModifiedResultsForGuidance = (results: MultiplexResults) => {
  const positiveFluResults = results.filter(
    (r) =>
      r.disease.name.includes("Flu") && r.testResult === TEST_RESULTS.POSITIVE
  );
  if (positiveFluResults.length > 1) {
    // remove one positive flu result if both are positive to avoid flu guidance duplication
    const fluResultsSet = new Set([positiveFluResults[0]]);
    results = results.filter((r) => !fluResultsSet.has(r));
  }
  return getSortedResults(results);
};

export const displayGuidance = (results: MultiplexResults) => {
  return (
    hasResultForDisease(results, MULTIPLEX_DISEASES.COVID_19, false) ||
    hasResultForDisease(results, MULTIPLEX_DISEASES.FLU_A, true) ||
    hasResultForDisease(results, MULTIPLEX_DISEASES.FLU_B, true) ||
    hasResultForDisease(results, MULTIPLEX_DISEASES.RSV, true) ||
    hasResultForDisease(results, MULTIPLEX_DISEASES.HIV, false) ||
    hasResultForDisease(results, MULTIPLEX_DISEASES.SYPHILIS, true)
  );
};
