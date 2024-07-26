import React from "react";
import { Trans, useTranslation } from "react-i18next";

import { TEST_RESULTS } from "../../testResults/constants";

type CovidResultInfoProps = {
  result: TestResult;
  isPatientApp: boolean;
};

const CovidResultInfo = ({ result, isPatientApp }: CovidResultInfoProps) => {
  const { t } = useTranslation();

  switch (result) {
    case TEST_RESULTS.POSITIVE:
      return (
        <>
          <p>{t("testResult.notes.positive.p1")}</p>
          <ul>
            <li>{t("testResult.notes.positive.guidelines.li0")}</li>
            <li>{t("testResult.notes.positive.guidelines.li1")}</li>
            <li>{t("testResult.notes.positive.guidelines.li2")}</li>
            <li>{t("testResult.notes.positive.guidelines.li3")}</li>
            <li>{t("testResult.notes.positive.guidelines.li4")}</li>
            <li>{t("testResult.notes.positive.guidelines.li5")}</li>
          </ul>
          <Trans
            parent="p"
            i18nKey="testResult.notes.positive.p2"
            components={[
              <a
                href={t("testResult.notes.positive.symptomsLink")}
                target="_blank"
                rel="noopener noreferrer"
                key="symptoms-link"
              >
                symptoms link
              </a>,
            ]}
          />
          <ul>
            <li>{t("testResult.notes.positive.emergency.li0")}</li>
            <li>{t("testResult.notes.positive.emergency.li1")}</li>
            <li>{t("testResult.notes.positive.emergency.li2")}</li>
            <li>{t("testResult.notes.positive.emergency.li3")}</li>
            <li>{t("testResult.notes.positive.emergency.li4")}</li>
          </ul>
          <p>{t("testResult.notes.positive.p3")}</p>
          <Trans
            parent="p"
            i18nKey="testResult.information"
            components={[
              <a
                href={t("testResult.cdcLink")}
                target="_blank"
                rel="noopener noreferrer"
                key="cdc-link-one"
              >
                cdc.gov
              </a>,
              <a
                href={t("testResult.countyCheckToolLink")}
                target="_blank"
                rel="noopener noreferrer"
                key="county-check-tool-link"
              >
                county check tool
              </a>,
            ]}
          />
        </>
      );
    case TEST_RESULTS.NEGATIVE:
      return (
        <>
          <p>{t("testResult.notes.negative.p0")}</p>
          <ul className={isPatientApp ? "" : "sr-multi-column"}>
            <li>{t("testResult.notes.negative.symptoms.li0")}</li>
            <li>{t("testResult.notes.negative.symptoms.li1")}</li>
            <li>{t("testResult.notes.negative.symptoms.li2")}</li>
            <li>{t("testResult.notes.negative.symptoms.li3")}</li>
            <li>{t("testResult.notes.negative.symptoms.li4")}</li>
            <li>{t("testResult.notes.negative.symptoms.li5")}</li>
            <li>{t("testResult.notes.negative.symptoms.li6")}</li>
            <li>{t("testResult.notes.negative.symptoms.li7")}</li>
            <li>{t("testResult.notes.negative.symptoms.li8")}</li>
            <li>{t("testResult.notes.negative.symptoms.li9")}</li>
            <li>{t("testResult.notes.negative.symptoms.li10")}</li>
          </ul>
          <Trans
            parent="p"
            i18nKey="testResult.notes.negative.moreInformation"
            components={[
              <a
                href={t("testResult.cdcLink")}
                target="_blank"
                rel="noopener noreferrer"
                key="cdc-link-two"
              >
                cdc.gov
              </a>,
            ]}
          />
        </>
      );
    case TEST_RESULTS.UNDETERMINED:
      return (
        <>
          <p>{t("testResult.notes.inconclusive.p0")}</p>
          {isPatientApp && <p>{t("testResult.notes.inconclusive.p1")}</p>}
        </>
      );
    default:
      return null;
  }
};
interface CovidResultGuidanceProps {
  result: MultiplexResult;
  isPatientApp: boolean;
}
const CovidResultGuidance = ({
  result,
  isPatientApp,
}: CovidResultGuidanceProps) => {
  const { t } = useTranslation();

  return (
    <>
      <p className="text-bold sr-guidance-heading">
        {t("testResult.notes.h1")}
      </p>
      <CovidResultInfo result={result.testResult} isPatientApp={isPatientApp} />
    </>
  );
};
export default CovidResultGuidance;
