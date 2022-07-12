import React from "react";
import { Trans, useTranslation } from "react-i18next";

import CovidResultGuidance from "../commonComponents/CovidResultGuidance";
import {
  hasPositiveFluResults,
  getResultByDiseaseName,
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
  const needsHeading = multiplexEnabled && hasPositiveFluResults(results);
  const testGuidanceArray: any = [];
  const covidResult = getResultByDiseaseName(results, "COVID-19") as TestResult;
  let covidGuidanceElement;
  if (isPatientApp) {
    covidGuidanceElement = (
      <CovidResultGuidance
        result={covidResult}
        isPatientApp={isPatientApp}
        needsHeading={needsHeading}
      />
    );
  } else {
    covidGuidanceElement = (
      <div className={needsHeading ? "sr-margin-bottom-28px" : ""}>
        <CovidResultGuidance
          result={covidResult}
          isPatientApp={isPatientApp}
          needsHeading={needsHeading}
        />
      </div>
    );
  }
  testGuidanceArray.push(covidGuidanceElement);

  if (needsHeading) {
    testGuidanceArray.push(setPositiveFluResultInfo(needsHeading, t));
  }
  return testGuidanceArray;
};

export default MultiplexResultsGuidance;
