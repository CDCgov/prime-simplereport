import React from "react";
import { useTranslation } from "react-i18next";

import { getResultByDiseaseName, getSortedResults } from "../utils/testResults";
import { MULTIPLEX_DISEASES, TEST_RESULTS } from "../testResults/constants";

interface TestResultsListProps {
  results: MultiplexResults;
  isPatientApp: boolean;
}

const setDiseaseName = (diseaseName: MultiplexDisease, t: translateFn) => {
  switch (diseaseName) {
    case MULTIPLEX_DISEASES.COVID_19:
      return t("constants.disease.COVID19");
    case MULTIPLEX_DISEASES.FLU_A:
      return t("constants.disease.FLUA");
    case MULTIPLEX_DISEASES.FLU_B:
      return t("constants.disease.FLUB");
    case MULTIPLEX_DISEASES.HIV:
      return t("constants.disease.HIV");
    case MULTIPLEX_DISEASES.RSV:
      return t("constants.disease.RSV");
    default:
      return "";
  }
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
  diseaseName: MultiplexDisease,
  result: TestResult,
  t: translateFn
) => {
  return (
    <li key={`${diseaseName}-${result}`}>
      <b>{setDiseaseName(diseaseName, t)}</b>
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
  diseaseName: MultiplexDisease,
  result: TestResult,
  t: translateFn
) => {
  return (
    <div key={`${diseaseName}-${result}`}>
      <h2 className="font-heading-sm">
        {setDiseaseName(diseaseName, t) + " " + t("testResult.resultLiteral")}
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
