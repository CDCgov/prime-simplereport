import React from "react";
import { useTranslation } from "react-i18next";

import {
  getResultByDiseaseName,
  getResultObjByDiseaseName,
  getSortedResults,
  hasMultiplexResults,
} from "../utils/testResults";
import { MULTIPLEX_DISEASES, TEST_RESULTS } from "../testResults/constants";

interface Props {
  results: MultiplexResults;
  isPatientApp: boolean;
  multiplexEnabled: boolean;
}

const setDiseaseName = (diseaseName: MultiplexDisease, t: translateFn) => {
  switch (diseaseName) {
    case MULTIPLEX_DISEASES.COVID_19:
      return t("constants.disease.COVID19");
    case MULTIPLEX_DISEASES.FLU_A:
      return t("constants.disease.FLUA");
    case MULTIPLEX_DISEASES.FLU_B:
      return t("constants.disease.FLUB");
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

const simpleReportAppResultList = (
  diseaseName: MultiplexDisease,
  result: TestResult,
  t: translateFn
) => {
  return (
    <li>
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

const pxpAppResultList = (
  diseaseName: MultiplexDisease,
  result: TestResult,
  t: translateFn
) => {
  return (
    <>
      <h2 className="font-heading-sm">{setDiseaseName(diseaseName, t)}</h2>
      <p className="margin-top-05 text-uppercase">
        {setResult(result, t)}
        <span>
          &nbsp;
          {setResultSymbol(result, t)}
        </span>
      </p>
    </>
  );
};

const TestResultsList = (props: Props) => {
  const results = props.results;
  const multiplexEnabled = props.multiplexEnabled;
  const isPatientApp = props.isPatientApp;
  const { t } = useTranslation();

  const sortedTestResults =
    multiplexEnabled && hasMultiplexResults(results)
      ? getSortedResults(results)
      : [getResultObjByDiseaseName(results, "COVID-19")];
  const testResultsArray: any = [];
  sortedTestResults.forEach((sortedTestResult: MultiplexResult) => {
    const diseaseName = sortedTestResult.disease.name;
    const sortedResult = getResultByDiseaseName(
      sortedTestResults,
      diseaseName
    ) as TestResult;
    let resultElement;
    if (isPatientApp) {
      resultElement = pxpAppResultList(diseaseName, sortedResult, t);
    } else {
      resultElement = simpleReportAppResultList(diseaseName, sortedResult, t);
    }
    testResultsArray.push(resultElement);
  });
  return testResultsArray;
};

export default TestResultsList;
