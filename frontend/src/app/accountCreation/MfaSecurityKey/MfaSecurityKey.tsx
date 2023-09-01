import React, { useEffect, useState } from "react";

import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import StepIndicator from "../../commonComponents/StepIndicator";
import { accountCreationSteps } from "../../../config/constants";
import { useDocumentTitle } from "../../utils/hooks";

export const MfaSecurityKey = () => {
  useDocumentTitle("Set up authentication via security key");

  const [unsupported, setUnsupported] = useState(false);

  useEffect(() => {
    // navigator.credentials is a global object on WebAuthn-supported clients, used to access WebAuthn API
    // if the user's browser doesn't support WebAuthn, display a message telling them to use a different browser
    if (!navigator?.credentials) {
      setUnsupported(true);
    }
  }, []);

  if (unsupported) {
    return (
      <CardBackground>
        <Card logo bodyKicker="Unsupported browser">
          <p className="margin-bottom-0">
            To register a security key, please use the latest version of a
            supported browser:
          </p>
          <ol className="usa-list usa-hint font-ui-2xs">
            <li>Google Chrome</li>
            <li>Mozilla Firefox</li>
            <li>Microsoft Edge</li>
          </ol>
        </Card>
      </CardBackground>
    );
  }

  return (
    <CardBackground>
      <Card logo bodyKicker="Set up your account">
        <StepIndicator
          steps={accountCreationSteps}
          currentStepValue={"2"}
          noLabels={true}
        />
        <p className="margin-bottom-0">How to register your security key.</p>
        <ol className="usa-list usa-hint font-ui-2xs">
          <li>Continue to SimpleReport and log in.</li>
          <li>
            Find “Security Key or Biometric Authenticator” in the Okta
            multifactor authentication menu and click{" "}
            <span className="text-bold">Setup</span>.
          </li>
          <li>Follow prompts to enroll.</li>
        </ol>
        <a
          href={"/app/"}
          className="margin-x-auto display-block width-fit-content usa-button usa-button--primary"
        >
          Continue to SimpleReport
        </a>
      </Card>
    </CardBackground>
  );
};
