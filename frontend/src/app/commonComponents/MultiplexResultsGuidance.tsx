import React from "react";
import { Trans, useTranslation } from "react-i18next";

import CovidResultGuidance from "../commonComponents/CovidResultGuidance";
import {
  hasPositiveFluResults,
  getResultByDiseaseName,
  haCovidResults,
} from "../utils/testResults";

type PositiveFluResultInfoProps = {
  needsHeading: boolean;
  t: translateFn;
};
const PositiveFluResultInfo = ({
  needsHeading,
  t,
}: PositiveFluResultInfoProps) => {
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
            key="flu-high-risk-link"
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
            key="flu-treatment-link"
          >
            flu treatment link
          </a>,
        ]}
      />
    </>
  );
};

interface MultiplexResultsGuidanceProps {
  results: MultiplexResult[];
  isPatientApp: boolean;
  multiplexEnabled: boolean;
}
const MultiplexResultsGuidance = (props: MultiplexResultsGuidanceProps) => {
  const results = props.results;
  const isPatientApp = props.isPatientApp;
  const multiplexEnabled = props.multiplexEnabled;
  const { t } = useTranslation();
  const needsCovidHeading = haCovidResults(results);
  const needsFluGuidance = multiplexEnabled && hasPositiveFluResults(results);
  const covidResult = getResultByDiseaseName(results, "COVID-19") as TestResult;

  return (
    <>
      <div
        className={
          needsCovidHeading && !isPatientApp ? "sr-margin-bottom-28px" : ""
        }
      >
        <CovidResultGuidance
          result={covidResult}
          isPatientApp={isPatientApp}
          needsHeading={needsCovidHeading}
        />
      </div>
      {needsFluGuidance && (
        <PositiveFluResultInfo needsHeading={needsFluGuidance} t={t} />
      )}
    </>
  );
};

export default MultiplexResultsGuidance;
