import React from "react";
import { Trans, useTranslation } from "react-i18next";

function ToS() {
  const { t } = useTranslation();

  return (
    <>
      <p>10/18/2021</p>
      <Trans
        t={t}
        i18nKey="testResult.tos.document.intro.p0"
        parent="p"
        components={[
          <a
            href="https://www.cdc.gov/other/information.html"
            key="cdc-privacy-policies-link"
          >
            CDC’s Privacy Policies
          </a>,
        ]}
      />
      <h2 id="scope">{t("testResult.tos.document.scope.heading")}</h2>
      <p>{t("testResult.tos.document.scope.p0")}</p>
      <h2 id="definitions">
        {t("testResult.tos.document.definitions.heading")}
      </h2>
      <ul>
        <li>
          <>
            <b>{t("testResult.tos.document.definitions.l0.title")}</b>{" "}
            {t("testResult.tos.document.definitions.l0.definition")}
          </>
        </li>
        <li>
          <>
            <b>{t("testResult.tos.document.definitions.l1.title")}</b>{" "}
            {t("testResult.tos.document.definitions.l1.definition")}
          </>
        </li>
      </ul>
      <h2 id="data-rights-and-usage">
        {t("testResult.tos.document.dataRights.heading")}
      </h2>
      <h3 id="accounts-registration">
        {t("testResult.tos.document.dataRights.subheading")}
      </h3>
      <h4>{t("testResult.tos.document.dataRights.section0")}</h4>
      <p>{t("testResult.tos.document.dataRights.p01")}</p>
      <Trans
        t={t}
        i18nKey="testResult.tos.document.dataRights.p02"
        parent="p"
        components={[
          <a href="mailto:support@simplereport.gov" key="support-email">
            support@simplereport.gov
          </a>,
        ]}
      />
      <h4>{t("testResult.tos.document.dataRights.section1")}</h4>
      <p>{t("testResult.tos.document.dataRights.p1")}</p>
      <h4>{t("testResult.tos.document.dataRights.section2")}</h4>
      <p>{t("testResult.tos.document.dataRights.p2")}</p>
      <h3 id="privacy">{t("testResult.tos.document.privacy.heading")}</h3>
      <Trans
        t={t}
        i18nKey="testResult.tos.document.privacy.p0"
        parent="p"
        components={[
          <a
            href="https://www.hhs.gov/foia/privacy/index.html"
            key="replaced-content"
          >
            this content is replaced
          </a>,
        ]}
      />
      <p>{t("testResult.tos.document.privacy.p1")}</p>
      <h3 id="use-of-data">{t("testResult.tos.document.useOfData.heading")}</h3>
      <p>{t("testResult.tos.document.useOfData.p0")}</p>
      <h3 id="sharing-of-data">
        {t("testResult.tos.document.sharingOfData.heading")}
      </h3>
      <Trans
        t={t}
        i18nKey="testResult.tos.document.sharingOfData.p0"
        parent="p"
        components={[
          <a
            href="https://www.hhs.gov/sites/default/files/covid-19-laboratory-data-reporting-guidance.pdf"
            key="laboratory-requirements"
          >
            HHS COVID-19 Laboratory Reporting Requirements
          </a>,
        ]}
      />
      <h3 id="other-responsibilities">
        {t("testResult.tos.document.otherResponsibilities.heading")}
      </h3>
      <h4>
        {t("testResult.tos.document.otherResponsibilities.ul.preheading1")}
      </h4>
      <ul>
        <li>{t("testResult.tos.document.otherResponsibilities.ul.li0")}</li>
        <li>{t("testResult.tos.document.otherResponsibilities.ul.li1")}</li>
        <li>{t("testResult.tos.document.otherResponsibilities.ul.li2")}</li>
        <li>{t("testResult.tos.document.otherResponsibilities.ul.li3")}</li>
      </ul>
      <h4>
        {t("testResult.tos.document.otherResponsibilities.ul.preheading2")}
      </h4>
      <ul>
        <li>{t("testResult.tos.document.otherResponsibilities.ul.li4")}</li>
        <li>{t("testResult.tos.document.otherResponsibilities.ul.li5")}</li>
        <li>{t("testResult.tos.document.otherResponsibilities.ul.li6")}</li>
        <li>{t("testResult.tos.document.otherResponsibilities.ul.li7")}</li>
        <li>{t("testResult.tos.document.otherResponsibilities.ul.li8")}</li>
      </ul>
      <h2 id="service-management">
        {t("testResult.tos.document.serviceManagement.heading")}
      </h2>
      <h3 id="right-to-limit">
        {t("testResult.tos.document.serviceManagement.subheading")}
      </h3>
      <p>{t("testResult.tos.document.serviceManagement.p0")}</p>
      <h3 id="service-termination">
        {t("testResult.tos.document.serviceTermination.heading")}
      </h3>
      <p>{t("testResult.tos.document.serviceTermination.p0")}</p>
      <p>{t("testResult.tos.document.serviceTermination.p1")}</p>
      <h3 id="intellectual-property-license-grant-and-restrictions-">
        {t("testResult.tos.document.intellectualProperty.heading")}
      </h3>
      <p>{t("testResult.tos.document.intellectualProperty.p0")}</p>
      <h3 id="disclaimer-of-warranties">
        {t("testResult.tos.document.disclaimerOfWarranties.heading")}
      </h3>
      <p>{t("testResult.tos.document.disclaimerOfWarranties.p0")}</p>
      <h3 id="limitations-on-liability">
        {t("testResult.tos.document.limitationOfLiability.heading")}
      </h3>
      <p>{t("testResult.tos.document.limitationOfLiability.p0")}</p>
      <p>{t("testResult.tos.document.limitationOfLiability.p1")}</p>
      <h3 id="disputes-choice-of-law-venue-and-conflicts">
        {t("testResult.tos.document.disputes.heading")}
      </h3>
      <p>{t("testResult.tos.document.disputes.p0")}</p>
      <h3 id="indemnification">
        {t("testResult.tos.document.indemnification.heading")}
      </h3>
      <p>{t("testResult.tos.document.indemnification.p0")}</p>
      <h3 id="no-waiver-of-rights">
        {t("testResult.tos.document.noWaiverOfRights.heading")}
      </h3>
      <p>{t("testResult.tos.document.noWaiverOfRights.p0")}</p>
      <h3 id="data-analytics-and-monitoring-metrics">
        {t("testResult.tos.document.dataAnalytics.heading")}
      </h3>
      <p>{t("testResult.tos.document.dataAnalytics.p0")}</p>
    </>
  );
}

export default ToS;
