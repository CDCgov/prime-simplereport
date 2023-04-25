import React from "react";
import { Trans, useTranslation } from "react-i18next";

import CovidResultGuidance from "../commonComponents/CovidResultGuidance";
import {
  hasPositiveFluResults,
  getResultByDiseaseName,
  haCovidResults,
} from "../utils/testResults";

interface Props {
  results: MultiplexResult[];
  isPatientApp: boolean;
  multiplexEnabled: boolean;
}

const setPositiveFluResultInfo = (needsHeading: boolean, t: translateFn) => {
  return (
    <>
      {needsHeading && (
        <p className="text-bold sr-guidance-heading">
          {t("testResult.fluNotes.h1")}
        </p>
      )}
      <p>{t("testResult.fluNotes.positive.p0")}</p>
      <Trans
        t={t}
        parent="p"
        i18nKey="testResult.fluNotes.positive.p1"
        components={[
          <a
            href={t("testResult.fluNotes.positive.highRiskLink")}
            target="_blank"
            rel="noopener noreferrer"
          >
            flu high risk link
          </a>,
        ]}
      />
      <Trans
        t={t}
        parent="p"
        i18nKey="testResult.fluNotes.positive.p2"
        components={[
          <a
            href={t("testResult.fluNotes.positive.treatmentLink")}
            target="_blank"
            rel="noopener noreferrer"
          >
            flu treatment link
          </a>,
        ]}
      />
    </>
  );
};

const MultiplexResultsGuidance = (props: Props) => {
  const results = props.results;
  const isPatientApp = props.isPatientApp;
  const multiplexEnabled = props.multiplexEnabled;
  const { t } = useTranslation();
  const needsCovidHeading = haCovidResults(results);
  const needsFluHeading = multiplexEnabled && hasPositiveFluResults(results);
  const testGuidanceArray: any = [];
  const covidResult = getResultByDiseaseName(results, "COVID-19") as TestResult;
  let covidGuidanceElement;
  if (isPatientApp) {
    covidGuidanceElement = (
      <CovidResultGuidance
        result={covidResult}
        isPatientApp={isPatientApp}
        needsHeading={needsCovidHeading}
      />
    );
  } else {
    covidGuidanceElement = (
      <div className={needsCovidHeading ? "sr-margin-bottom-28px" : ""}>
        <CovidResultGuidance
          result={covidResult}
          isPatientApp={isPatientApp}
          needsHeading={needsCovidHeading}
        />
      </div>
    );
  }
  testGuidanceArray.push(covidGuidanceElement);

  if (needsFluHeading) {
    testGuidanceArray.push(setPositiveFluResultInfo(needsFluHeading, t));
  }
  return testGuidanceArray;
};

export default MultiplexResultsGuidance;
