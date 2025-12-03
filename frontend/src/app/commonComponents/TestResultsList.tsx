import React from "react";
import { useTranslation } from "react-i18next";

import { getResultByDiseaseName, getSortedResults } from "../utils/testResults";
import { MULTIPLEX_DISEASES, TEST_RESULTS } from "../testResults/constants";

interface TestResultsListProps {
  results: MultiplexResults;
  isPatientApp: boolean;
}

const setDiseaseResultTitle = (
  diseaseName: MULTIPLEX_DISEASES,
  t: translateFn,
  isPxp: boolean
) => {
  const translationKey = isPxp
    ? diseaseResultTitlePxpMap[diseaseName]
    : diseaseResultReportingAppMap[diseaseName];
  if (translationKey) {
    return t(translationKey);
  }
  return "";
};

const diseaseResultTitlePxpMap: Record<MULTIPLEX_DISEASES, string> = {
  [MULTIPLEX_DISEASES.COVID_19]: "constants.diseaseResultTitle.COVID19",
  [MULTIPLEX_DISEASES.FLU_A]: "constants.diseaseResultTitle.FLUA",
  [MULTIPLEX_DISEASES.FLU_B]: "constants.diseaseResultTitle.FLUB",
  [MULTIPLEX_DISEASES.FLU_A_AND_B]: "constants.diseaseResultTitle.FLUAB",
  [MULTIPLEX_DISEASES.HIV]: "constants.diseaseResultTitle.HIV",
  [MULTIPLEX_DISEASES.RSV]: "constants.diseaseResultTitle.RSV",
  [MULTIPLEX_DISEASES.SYPHILIS]: "constants.diseaseResultTitle.SYPHILIS",
  [MULTIPLEX_DISEASES.HEPATITIS_C]: "constants.diseaseResultTitle.HEPATITIS_C",
  [MULTIPLEX_DISEASES.GONORRHEA]: "constants.diseaseResultTitle.GONORRHEA",
  [MULTIPLEX_DISEASES.CHLAMYDIA]: "constants.diseaseResultTitle.CHLAMYDIA",
};

const diseaseResultReportingAppMap: Record<MULTIPLEX_DISEASES, string> = {
  [MULTIPLEX_DISEASES.COVID_19]: "constants.disease.COVID19",
  [MULTIPLEX_DISEASES.FLU_A]: "constants.disease.FLUA",
  [MULTIPLEX_DISEASES.FLU_B]: "constants.disease.FLUB",
  [MULTIPLEX_DISEASES.FLU_A_AND_B]: "constants.disease.FLUAB",
  [MULTIPLEX_DISEASES.HIV]: "constants.disease.HIV",
  [MULTIPLEX_DISEASES.RSV]: "constants.disease.RSV",
  [MULTIPLEX_DISEASES.SYPHILIS]: "constants.disease.SYPHILIS",
  [MULTIPLEX_DISEASES.HEPATITIS_C]: "constants.disease.HEPATITIS_C",
  [MULTIPLEX_DISEASES.GONORRHEA]: "constants.disease.GONORRHEA",
  [MULTIPLEX_DISEASES.CHLAMYDIA]: "constants.disease.CHLAMYDIA",
};

const setResult = (result: string, t: translateFn) => {
  switch (result) {
    case TEST_RESULTS.POSITIVE:
      return t("constants.testResults.POSITIVE");
    case TEST_RESULTS.NEGATIVE:
      return t("constants.testResults.NEGATIVE");
    default:
      return t("constants.testResults.UNDETERMINED");
  }
};

const setResultSymbol = (result: string, t: translateFn) => {
  switch (result) {
    case TEST_RESULTS.POSITIVE:
      return t("constants.testResultsSymbols.POSITIVE");
    case TEST_RESULTS.NEGATIVE:
      return t("constants.testResultsSymbols.NEGATIVE");
    default:
      return "";
  }
};

const reportingAppResultListItem = (
  diseaseName: MULTIPLEX_DISEASES,
  result: TestResult,
  t: translateFn
) => {
  return (
    <li key={`${diseaseName}-${result}`}>
      <b>{setDiseaseResultTitle(diseaseName, t, false)}</b>
      <div>
        <strong>
          <span className="text-uppercase">{setResult(result, t)}</span>
          <span>
            &nbsp;
            {setResultSymbol(result, t)}
          </span>
        </strong>
      </div>
    </li>
  );
};

const pxpAppResultListItem = (
  diseaseName: MULTIPLEX_DISEASES,
  result: TestResult,
  t: translateFn
) => {
  return (
    <div key={`${diseaseName}-${result}`}>
      <h2 className="font-heading-sm">
        {setDiseaseResultTitle(diseaseName, t, true)}
      </h2>
      <p className="margin-top-05 text-uppercase">
        {setResult(result, t)}
        <span>
          &nbsp;
          {setResultSymbol(result, t)}
        </span>
      </p>
    </div>
  );
};

const TestResultsList: React.FC<TestResultsListProps> = ({
  results,
  isPatientApp,
}) => {
  const { t } = useTranslation();

  const sortedTestResults = getSortedResults(results);

  return (
    <>
      {sortedTestResults.map((sortedTestResult: MultiplexResult) => {
        const diseaseName = sortedTestResult.disease.name;
        const sortedResult = getResultByDiseaseName(
          sortedTestResults,
          diseaseName
        ) as TestResult;

        return isPatientApp
          ? pxpAppResultListItem(diseaseName, sortedResult, t)
          : reportingAppResultListItem(diseaseName, sortedResult, t);
      })}
    </>
  );
};

export default TestResultsList;
