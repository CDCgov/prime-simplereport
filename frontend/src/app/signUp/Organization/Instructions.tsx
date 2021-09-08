import { useState } from "react";

import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import Button from "../../commonComponents/Button/Button";
import { TextWithTooltip } from "../../commonComponents/TextWithTooltip";

import OrganizationForm from "./OrganizationForm";

const Instructions = () => {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return <OrganizationForm />;
  }

  return (
    <CardBackground>
      <Card logo>
        <div className="margin-bottom-2">
          <h2>Sign up for SimpleReport</h2>
          <p className="font-ui-2xs line-height-sans-5">
            Request access for your{" "}
            <TextWithTooltip
              text="organization"
              tooltip="Organizations have multiple testing facilities or locations as part of their network."
              position="top"
              className="font-ui-2xs"
            />{" "}
            in three steps: <br />
            1. Fill out your organization information <br />
            2. Enter your personal contact details <br />
            3. Complete identity verification
          </p>
          <p className="font-ui-2xs margin-top-0 line-height-sans-5">
            Each organization gets one account and just needs to sign up one
            time. After your organization sign up is complete, organization
            admins can add additional staff and testing locations to the account
            at any time. Learn more about our{" "}
            <a href="/getting-started/organizations-and-testing-facilities/onboard-your-organization/">
              sign up and identity verification process
            </a>
            .
          </p>
          <p className="font-ui-2xs margin-top-0 line-height-sans-5">
            Not sure if your organization already has SimpleReport? Email{" "}
            <a href="mailto:support@simplereport.gov">
              support@simplereport.gov
            </a>
            .
          </p>
        </div>
        <Button
          className="width-full continue-button"
          onClick={() => setSubmitted(true)}
          label={"Continue"}
        />
      </Card>
    </CardBackground>
  );
};

export default Instructions;
