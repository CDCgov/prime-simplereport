import React from "react";
import { Trans, useTranslation } from "react-i18next";

import { TEST_RESULTS } from "../../testResults/constants";

import { ResultGuidanceProps } from "./ResultsGuidance";

const PositiveRsvResultInfo = () => {
  const { t } = useTranslation();

  return (
    <>
      <p className="text-bold sr-guidance-heading">
        {t("testResult.rsvNotes.h1")}
      </p>
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

const RsvResultGuidance = ({ result }: ResultGuidanceProps) => {
  const displayRsvGuidance = result.testResult === TEST_RESULTS.POSITIVE;
  return <>{displayRsvGuidance && <PositiveRsvResultInfo />}</>;
};

export default RsvResultGuidance;
