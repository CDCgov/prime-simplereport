import React from "react";
import { Trans, useTranslation } from "react-i18next";

const ChlamydiaResultGuidance = () => {
  const { t } = useTranslation();

  return (
    <>
      <p className="text-bold sr-guidance-heading">
        {t("testResult.chlamydiaNotes.h1")}
      </p>
      <p>{t("testResult.chlamydiaNotes.positive.p0")}</p>
      <Trans
        parent="p"
        i18nKey="testResult.chlamydiaNotes.positive.p1"
        components={[
          <a
            href={t("testResult.chlamydiaNotes.positive.treatmentLink")}
            target="_blank"
            rel="noopener noreferrer"
            key="chlamydia-treatment-link"
          >
            chlamydia treatment link
          </a>,
        ]}
      />
    </>
  );
};

export default ChlamydiaResultGuidance;
