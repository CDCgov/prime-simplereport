import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Redirect, RouteComponentProps, withRouter } from "react-router";

import Button from "../../app/commonComponents/Button/Button";

import ToS from "./ToS";

const TermsOfService: React.FunctionComponent<RouteComponentProps> = (
  props
) => {
  const [nextPage, setNextPage] = useState(false);
  const plid = useSelector((state: any) => state.plid);

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
    <main className="patient-app padding-bottom-4 bg-base-lightest">
      <form className="grid-container maxw-tablet usa-prose">
        <h1 className="font-heading-lg margin-top-3">Terms of service</h1>
        <p className="margin-top-105">
          This testing site uses{" "}
          <a href="https://simplereport.gov/">SimpleReport</a> to manage
          COVID-19 testing and reporting. The terms below explain SimpleReport’s
          policies and terms of service.
        </p>
        <div className="tos-content prime-formgroup usa-prose height-card-lg overflow-x-hidden font-body-3xs">
          <ToS />
        </div>
        <p>By agreeing, you consent to our terms of service.</p>
        <Button
          id="tos-consent-button"
          label="I agree"
          onClick={() => setNextPage(true)}
        />
      </form>
    </main>
  );
};

export default withRouter(TermsOfService);
