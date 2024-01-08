import React from "react";
import { Trans, useTranslation } from "react-i18next";

import CovidResultGuidance from "../commonComponents/CovidResultGuidance";
import {
  hasPositiveFluResults,
  getResultByDiseaseName,
  hasCovidResults,
  hasPositiveRsvResults,
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

type PositiveRsvResultInfoProps = {
  needsHeading: boolean;
  t: translateFn;
};
const PositiveRsvResultInfo = ({
  needsHeading,
  t,
}: PositiveRsvResultInfoProps) => {
  return (
    <>
      {needsHeading && (
        <p className="text-bold sr-guidance-heading">
          {t("testResult.rsvNotes.h1")}
        </p>
      )}
      <p>{t("testResult.rsvNotes.positive.p0")}</p>
      <p>{t("testResult.rsvNotes.positive.p1")}</p>
      <Trans
        parent="p"
        i18nKey="testResult.rsvNotes.positive.p2"
        components={[
          <a
            href={t("testResult.rsvNotes.positive.rsvSymptomsLink")}
            target="_blank"
            rel="noopener noreferrer"
            key="rsv-symptoms-link"
          >
            rsv symptoms link
          </a>,
        ]}
      />
    </>
  );
};

interface MultiplexResultsGuidanceProps {
  results: MultiplexResult[];
  isPatientApp: boolean;
}
const MultiplexResultsGuidance: React.FC<MultiplexResultsGuidanceProps> = ({
  results,
  isPatientApp,
}) => {
  const { t } = useTranslation();
  const needsCovidHeading = hasCovidResults(results);
  const needsFluGuidance = hasPositiveFluResults(results);
  const needsRsvGuidance = hasPositiveRsvResults(results);
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
      {needsRsvGuidance && (
        <PositiveRsvResultInfo needsHeading={needsRsvGuidance} t={t} />
      )}
    </>
  );
};

export default MultiplexResultsGuidance;
