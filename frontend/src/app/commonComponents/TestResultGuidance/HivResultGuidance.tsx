import React from "react";
import { Trans, useTranslation } from "react-i18next";

const HivResultInfo = () => {
  const { t } = useTranslation();

  return (
    <>
      <p className="text-bold sr-guidance-heading">
        {t("testResult.hivNotes.h1")}
      </p>
      <p>{t("testResult.hivNotes.all.p0")}</p>
      <Trans
        parent="p"
        i18nKey="testResult.hivNotes.all.p1"
        components={[
          <a
            href={t("testResult.hivNotes.all.positiveHivLink")}
            target="_blank"
            rel="noopener noreferrer"
            key="positive-hiv-link"
          >
            positive hiv link
          </a>,
        ]}
      />
    </>
  );
};

const HivResultGuidance = () => {
  return <HivResultInfo />;
};

export default HivResultGuidance;
