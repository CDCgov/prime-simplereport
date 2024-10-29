import React from "react";
import { Trans, useTranslation } from "react-i18next";

const HepatitisCResultGuidance = () => {
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

export default HepatitisCResultGuidance;
