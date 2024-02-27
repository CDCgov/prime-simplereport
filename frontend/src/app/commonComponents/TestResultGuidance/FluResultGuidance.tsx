import React from "react";
import { Trans, useTranslation } from "react-i18next";

import { TEST_RESULTS } from "../../testResults/constants";

import { ResultGuidanceProps } from "./ResultsGuidance";

const PositiveFluResultInfo = () => {
  const { t } = useTranslation();

  return (
    <>
      <p className="text-bold sr-guidance-heading">
        {t("testResult.fluNotes.h1")}
      </p>
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

const FluResultGuidance = ({ result }: ResultGuidanceProps) => {
  const hasPositiveFluResult = result.testResult === TEST_RESULTS.POSITIVE;
  return <>{hasPositiveFluResult && <PositiveFluResultInfo />}</>;
};

export default FluResultGuidance;
