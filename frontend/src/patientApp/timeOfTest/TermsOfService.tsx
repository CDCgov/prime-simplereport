import React, { useState } from "react";
import { useSelector } from "react-redux";
import classnames from "classnames";
import { Trans, useTranslation } from "react-i18next";
import { Navigate } from "react-router-dom";

import Button from "../../app/commonComponents/Button/Button";
import { useDocumentTitle } from "../../app/utils/hooks";

import ToS from "./ToS";

interface Props {
  className?: string;
  onAgree?: () => void;
  asPage?: boolean;
}

const TermsOfService: React.FunctionComponent<Props> = ({
  className,
  onAgree,
  asPage = false,
}) => {
  const [nextPage, setNextPage] = useState(false);
  const plid = useSelector((state: any) => state.plid);

  const { t } = useTranslation();
  useDocumentTitle(t("testResult.tos.title"));

  if (nextPage) {
    return (
      <Navigate
        to={{
          pathname: "/pxp/birth-date-confirmation",
          search: `?plid=${plid}`,
        }}
      />
    );
  }

  return (
    <div
      className={classnames(
        "patient-app padding-bottom-4 bg-base-lightest flex-1",
        className
      )}
    >
      <form className="grid-container maxw-tablet usa-prose">
        {asPage ? (
          <h1 className="font-heading-lg margin-top-3">
            {t("testResult.tos.header")}
          </h1>
        ) : (
          <h2 className="font-heading-lg margin-top-3">
            {t("testResult.tos.header")}
          </h2>
        )}
        <Trans
          t={t}
          parent="p"
          className="margin-top-105"
          i18nKey="testResult.tos.introText"
          components={[
            <a href="https://simplereport.gov/" key="simple-report-link">
              SimpleReport
            </a>,
          ]}
        />
        <div className="tos-content prime-formgroup usa-prose height-card-lg overflow-x-hidden font-body-3xs">
          <ToS />
        </div>
        <p id="tos-consent-message">{t("testResult.tos.consent")}</p>
        <Button
          id="tos-consent-button"
          label={t("testResult.tos.submit")}
          ariaDescribedBy={"tos-consent-message"}
          onClick={() => {
            if (onAgree) {
              onAgree();
            } else {
              setNextPage(true);
            }
          }}
        />
      </form>
    </div>
  );
};

export default TermsOfService;
