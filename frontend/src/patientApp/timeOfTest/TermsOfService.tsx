import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Redirect, RouteComponentProps, withRouter } from "react-router";
import classnames from "classnames";
import { Trans, useTranslation } from "react-i18next";

import Button from "../../app/commonComponents/Button/Button";

import ToS from "./ToS";

interface Props extends RouteComponentProps {
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
      <Redirect
        to={{
          pathname: "/birth-date-confirmation",
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
        <h1 className="font-heading-lg margin-top-3">{t("terms.label")}</h1>
        <Trans
          t={t}
          parent="p"
          className="margin-top-105"
          i18nKey="terms.explanation"
          components={[
            <a href="https://simplereport.gov/">SimpleReport Link</a>,
          ]}
        />
        <div className="tos-content prime-formgroup usa-prose height-card-lg overflow-x-hidden font-body-3xs">
          <ToS />
        </div>
        <p>By agreeing, you consent to our terms of service.</p>
        <Button
          id="tos-consent-button"
          label="I agree"
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

export default withRouter(TermsOfService);
