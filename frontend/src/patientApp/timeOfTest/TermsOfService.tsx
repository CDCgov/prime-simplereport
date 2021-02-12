import React, { useState } from "react";
import Button from "../../app/commonComponents/Button";
import ToS from "./ToS";
import { Redirect } from "react-router";

const TermsOfService = () => {
  const [nextPage, setNextPage] = useState(false);

  if (nextPage) {
    return <Redirect push to={"/birth-date-confirmation"} />;
  }

  return (
    <main className="patient-app padding-bottom-4 bg-base-lightest">
      <form className="grid-container maxw-tablet">
        <h1 className="font-heading-lg margin-top-3 margin-bottom-2">
          Terms of Service
        </h1>
        <div className="tos-content prime-formgroup usa-prose height-card-lg overflow-x-hidden font-body-3xs">
          <ToS />
        </div>
        <Button
          label="I consent to the Terms of Service"
          onClick={() => setNextPage(true)}
          className="margin-top-3"
        />
      </form>
    </main>
  );
};

export default TermsOfService;
