import React from "react";
import { Trans, useTranslation } from "react-i18next";

import { TEST_RESULTS } from "../../testResults/constants";

import { ResultGuidanceProps } from "./ResultsGuidance";

const PositiveHepatitisCResultInfo = () => {
  const { t } = useTranslation();

  return (
    <>
      <p className="text-bold sr-guidance-heading">
        {t("testResult.hepatitisCNotes.h1")}
      </p>
      <p>{t("testResult.hepatitisCNotes.positive.p0")}</p>
      <Trans
        parent="p"
        i18nKey="testResult.hepatitisCNotes.positive.p1"
        components={[
          <a
            href={t("testResult.hepatitisCNotes.positive.treatmentLink")}
            target="_blank"
            rel="noopener noreferrer"
            key="hepatitis-c-treatment-link"
          >
            hepatitis-c treatment link
          </a>,
        ]}
      />
    </>
  );
};

const HepatitisCResultGuidance = ({ result }: ResultGuidanceProps) => {
  const hasPositiveHepatitisCResult =
    result.testResult === TEST_RESULTS.POSITIVE;
  return <>{hasPositiveHepatitisCResult && <PositiveHepatitisCResultInfo />}</>;
};

export default HepatitisCResultGuidance;
