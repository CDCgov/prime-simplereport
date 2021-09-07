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
            Get access for your{" "}
            <TextWithTooltip
              text="organization"
              tooltip="Organizations have multiple testing facilities or locations as part of their network."
              position="top"
              className="font-ui-2xs"
            />{" "}
            in two steps: <br />
            1. Request access for your organization <br />
            2. Verify your identity
          </p>
          <p className="font-ui-2xs margin-top-0 line-height-sans-5">
            Each organization should only sign up one time. After your
            organization profile is complete, you can add additional users and
            locations. Learn more about our{" "}
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
          className="width-full"
          onClick={() => setSubmitted(true)}
          label={"Continue"}
        />
      </Card>
    </CardBackground>
  );
};

export default Instructions;
