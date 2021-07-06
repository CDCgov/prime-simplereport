import { Trans, useTranslation } from "react-i18next";

interface headerParagraphProps {
  header: string;
  headerId: string;
  paragraphs: string[];
}
function HeaderWithParagraphs(props: headerParagraphProps) {
  return (
    <>
      <h3 id={props.headerId}>{props.header}</h3>
      {props.paragraphs.map((p) => (
        <p>{p}</p>
      ))}
    </>
  );
}

function ToS() {
  const { t } = useTranslation();
  const headerParagraphBlocks: headerParagraphProps[] = [
    {
      headerId: "right-to-limit",
      header: t("testResult.tos.document.serviceManagement.subheading"),
      paragraphs: [t("testResult.tos.document.serviceManagement.p0")],
    },
    {
      headerId: "service-termination",
      header: t("testResult.tos.document.serviceTermination.heading"),
      paragraphs: [
        t("testResult.tos.document.serviceTermination.p0"),
        t("testResult.tos.document.serviceTermination.p1"),
      ],
    },
    {
      headerId: "intellectual-property-license-grant-and-restrictions",
      header: t("testResult.tos.document.intellectualProperty.heading"),
      paragraphs: [t("testResult.tos.document.intellectualProperty.p0")],
    },
    {
      headerId: "disclaimer-of-warranties",
      header: t("testResult.tos.document.disclaimerOfWarranties.heading"),
      paragraphs: [t("testResult.tos.document.disclaimerOfWarranties.p0")],
    },
    {
      headerId: "limitations-on-liability",
      header: t("testResult.tos.document.limitationOfLiability.heading"),
      paragraphs: [
        t("testResult.tos.document.limitationOfLiability.p0"),
        t("testResult.tos.document.limitationOfLiability.p1"),
      ],
    },
    {
      headerId: "disputes-choice-of-law-venue-and-conflicts",
      header: t("testResult.tos.document.disputes.heading"),
      paragraphs: [t("testResult.tos.document.disputes.p0")],
    },
    {
      headerId: "indemnification",
      header: t("testResult.tos.document.indemnification.heading"),
      paragraphs: [t("testResult.tos.document.indemnification.p0")],
    },
    {
      headerId: "no-waiver-of-rights",
      header: t("testResult.tos.document.noWaiverOfRights.heading"),
      paragraphs: [t("testResult.tos.document.noWaiverOfRights.p0")],
    },
    {
      headerId: "data-analytics-and-monitoring-metrics",
      header: t("testResult.tos.document.dataAnalytics.heading"),
      paragraphs: [t("testResult.tos.document.dataAnalytics.p0")],
    },
  ];

  return (
    <>
      <p>12/4/2020</p>
      <Trans
        t={t}
        i18nKey="testResult.tos.document.intro.p0"
        parent="p"
        components={[
          <a href="https://www.cdc.gov/other/information.html">
            CDC's Privacy Policies
          </a>,
        ]}
      />
      <h2 id="scope">{t("testResult.tos.document.scope.heading")}</h2>
      <p>{t("testResult.tos.document.scope.p0")}</p>
      <h2 id="data-rights-and-usage">
        {t("testResult.tos.document.dataRights.heading")}
      </h2>
      <h3 id="accounts-registration">
        {t("testResult.tos.document.dataRights.subheading")}
      </h3>
      <ul>
        <li>{t("testResult.tos.document.dataRights.l0")}</li>
      </ul>
      <p>{t("testResult.tos.document.dataRights.p0")}</p>
      <ul>
        <li>{t("testResult.tos.document.dataRights.l1")}</li>
      </ul>
      <p>{t("testResult.tos.document.dataRights.p1")}</p>
      <h3 id="privacy">{t("testResult.tos.document.privacy.heading")}</h3>
      <Trans
        t={t}
        i18nKey="testResult.tos.document.privacy.p0"
        parent="p"
        components={[
          <a href="https://www.cms.gov/Research-Statistics-Data-and-Systems/Computer-Data-and-Systems/Privacy/PrivacyActof1974.html">
            click here
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
          <a href="https://www.hhs.gov/sites/default/files/covid-19-laboratory-data-reporting-guidance.pdf">
            HHS COVID-19 Laboratory Reporting Requirements
          </a>,
        ]}
      />
      <h3 id="other-responsibilities">
        {t("testResult.tos.document.otherResponsibilities.heading")}
      </h3>
      <ul>
        <li>{t("testResult.tos.document.otherResponsibilities.ul.li0")}</li>
        <li>{t("testResult.tos.document.otherResponsibilities.ul.li1")}</li>
        <li>{t("testResult.tos.document.otherResponsibilities.ul.li2")}</li>
        <li>{t("testResult.tos.document.otherResponsibilities.ul.li3")}</li>
        <li>{t("testResult.tos.document.otherResponsibilities.ul.li4")}</li>
        <li>{t("testResult.tos.document.otherResponsibilities.ul.li5")}</li>
        <li>{t("testResult.tos.document.otherResponsibilities.ul.li6")}</li>
        <li>{t("testResult.tos.document.otherResponsibilities.ul.li7")}</li>
        <li>{t("testResult.tos.document.otherResponsibilities.ul.li8")}</li>
      </ul>
      <h2 id="service-management">
        {t("testResult.tos.document.serviceManagement.heading")}
      </h2>
      {headerParagraphBlocks.map((block) => (
        <HeaderWithParagraphs
          headerId={block.headerId}
          header={block.header}
          paragraphs={block.paragraphs}
        />
      ))}
    </>
  );
}

export default ToS;
