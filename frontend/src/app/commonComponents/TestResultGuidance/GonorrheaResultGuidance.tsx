import React from "react";
import { Trans, useTranslation } from "react-i18next";

const GonorrheaResultGuidance = () => {
  const { t } = useTranslation();

  return (
    <>
      <p className="text-bold sr-guidance-heading">
        {t("testResult.gonorrheaNotes.h1")}
      </p>
      <p>{t("testResult.gonorrheaNotes.positive.p0")}</p>
      <Trans
        parent="p"
        i18nKey="testResult.gonorrheaNotes.positive.p1"
        components={[
          <a
            href={t("testResult.gonorrheaNotes.positive.treatmentLink")}
            target="_blank"
            rel="noopener noreferrer"
            key="gonorrhea-treatment-link"
          >
            gonorrhea treatment link
          </a>,
        ]}
      />
    </>
  );
};

export default GonorrheaResultGuidance;
