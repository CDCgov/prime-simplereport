import React from "react";
import { Trans, useTranslation } from "react-i18next";

import { TEST_RESULTS } from "../../testResults/constants";

import { ResultGuidanceProps } from "./ResultsGuidance";

const PositiveSyphilisResultInfo = () => {
  const { t } = useTranslation();

  return (
    <>
      <p className="text-bold sr-guidance-heading">
        {t("testResult.syphilisNotes.h1")}
      </p>
      <p>{t("testResult.syphilisNotes.positive.p0")}</p>
      <Trans
        parent="p"
        i18nKey="testResult.syphilisNotes.positive.p1"
        components={[
          <a
            href={t("testResult.syphilisNotes.positive.treatmentLink")}
            target="_blank"
            rel="noopener noreferrer"
            key="syphilis-treatment-link"
          >
            syphilis treatment link
          </a>,
        ]}
      />
    </>
  );
};

const SyphilisResultGuidance = ({ result }: ResultGuidanceProps) => {
  const hasPositiveSyphilisResult = result.testResult === TEST_RESULTS.POSITIVE;
  return <>{hasPositiveSyphilisResult && <PositiveSyphilisResultInfo />}</>;
};

export default SyphilisResultGuidance;
