import { MULTIPLEX_DISEASES, TEST_RESULTS } from "../testResults/constants";
import { MultiplexResultInput } from "../../generated/graphql";
import CovidResultGuidance from "../commonComponents/TestResultGuidance/CovidResultGuidance";
import FluResultGuidance from "../commonComponents/TestResultGuidance/FluResultGuidance";
import HivResultGuidance from "../commonComponents/TestResultGuidance/HivResultGuidance";
import RsvResultGuidance from "../commonComponents/TestResultGuidance/RsvResultGuidance";
import SyphilisResultGuidance from "../commonComponents/TestResultGuidance/SyphilisResultGuidance";
import HepatitisCResultGuidance from "../commonComponents/TestResultGuidance/HepatitisCResultGuidance";
import GonorrheaResultGuidance from "../commonComponents/TestResultGuidance/GonorrheaResultGuidance";
import ChlamydiaResultGuidance from "../commonComponents/TestResultGuidance/ChlamydiaResultGuidance";

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

export function getResultForDisease(
  results: MultiplexResults | null | undefined,
  diseaseName: MultiplexDisease,
  positivesOnly: boolean = false
): MultiplexResult | undefined {
  if (!results) {
    return undefined;
  }
  const matches: MultiplexResult[] = results.filter(
    (multiplexResult: MultiplexResult) =>
      multiplexResult.disease.name === diseaseName &&
      (!positivesOnly || multiplexResult.testResult === TEST_RESULTS.POSITIVE)
  );
  return matches.at(0);
}

export const getGuidanceForResults = (
  results: MultiplexResult[],
  isPatientApp: boolean
) => {
  const guidance: JSX.Element[] = [];

  let match = getResultForDisease(results, MULTIPLEX_DISEASES.COVID_19);
  if (match) {
    guidance.push(
      <CovidResultGuidance result={match} isPatientApp={isPatientApp} />
    );
  }

  match =
    getResultForDisease(results, MULTIPLEX_DISEASES.FLU_A, true) ||
    getResultForDisease(results, MULTIPLEX_DISEASES.FLU_B, true) ||
    getResultForDisease(results, MULTIPLEX_DISEASES.FLU_A_AND_B, true);
  if (match) {
    guidance.push(<FluResultGuidance result={match} />);
  }

  match = getResultForDisease(results, MULTIPLEX_DISEASES.HIV);
  if (match) {
    guidance.push(<HivResultGuidance />);
  }

  match = getResultForDisease(results, MULTIPLEX_DISEASES.RSV, true);
  if (match) {
    guidance.push(<RsvResultGuidance result={match} />);
  }

  match = getResultForDisease(results, MULTIPLEX_DISEASES.SYPHILIS, true);
  if (match) {
    guidance.push(<SyphilisResultGuidance result={match} />);
  }

  match = getResultForDisease(results, MULTIPLEX_DISEASES.HEPATITIS_C);
  if (match) {
    guidance.push(<HepatitisCResultGuidance />);
  }

  match = getResultForDisease(results, MULTIPLEX_DISEASES.GONORRHEA);
  if (match) {
    guidance.push(<GonorrheaResultGuidance />);
  }

  match = getResultForDisease(results, MULTIPLEX_DISEASES.CHLAMYDIA);
  if (match) {
    guidance.push(<ChlamydiaResultGuidance />);
  }

  return guidance;
};
