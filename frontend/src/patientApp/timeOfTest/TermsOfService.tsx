import React, { useState } from "react";
import { useSelector } from "react-redux";
import classnames from "classnames";
import { Trans, useTranslation } from "react-i18next";
import { Navigate } from "react-router-dom";

import Button from "../../app/commonComponents/Button/Button";

import ToS from "./ToS";

interface Props {
  className?: string;
  onAgree?: () => void;
}

const TermsOfService: React.FunctionComponent<Props> = ({
  className,
  onAgree,
}) => {
  const [nextPage, setNextPage] = useState(false);
  const plid = useSelector((state: any) => state.plid);

  const { t } = useTranslation();

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
    <main
      className={classnames(
        "patient-app padding-bottom-4 bg-base-lightest",
        className
      )}
    >
      <form className="grid-container maxw-tablet usa-prose">
        <h1 className="font-heading-lg margin-top-3">
          {t("testResult.tos.header")}
        </h1>
        <Trans
          t={t}
          parent="p"
          className="margin-top-105"
          i18nKey="testResult.tos.introText"
          components={[<a href="https://simplereport.gov/">SimpleReport</a>]}
        />
        <div className="tos-content prime-formgroup usa-prose height-card-lg overflow-x-hidden font-body-3xs">
          <ToS />
        </div>
        <p>{t("testResult.tos.consent")}</p>
        <Button
          id="tos-consent-button"
          label={t("testResult.tos.submit")}
          onClick={() => {
            if (onAgree) {
              onAgree();
            } else {
              setNextPage(true);
            }
          }}
        />
      </form>
    </main>
  );
};

export default TermsOfService;
