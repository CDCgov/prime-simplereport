import { useState } from "react";

import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import Button from "../../commonComponents/Button/Button";
import RadioGroup from "../../commonComponents/RadioGroup";
import StepIndicator from "../../commonComponents/StepIndicator";
import { accountCreationSteps } from "../../../config/constants";

export const MfaSelect = () => {
  const [mfaOption, setMfaOption] = useState("");
  const [mfaOptionError, setMfaOptionError] = useState("");

  const validateMfaOption = () => {
    if (mfaOption === "") {
      setMfaOptionError("Select an authentication option");
    } else {
      setMfaOptionError("");
    }
  };

  return (
    <CardBackground>
      <Card logo bodyKicker="Set up your account">
        <StepIndicator
          steps={accountCreationSteps}
          currentStepValue={"2"}
          noLabels={true}
        />
        <RadioGroup
          name="addressSelect"
          legend="Add a second layer of security to protect your account."
          required
          buttons={[
            {
              value: "SMS",
              label: "Text message (SMS)",
              labelDescription:
                "Get a single-use code sent via text message (SMS).",
              labelTag: "Less secure",
            },
            {
              value: "Okta",
              label: "Okta Verify",
              labelDescription:
                "Get a push notification sent through the Okta mobile app.",
              labelTag: "Secure",
            },
            {
              value: "Google",
              label: "Google Authenticator",
              labelDescription:
                "Get a single-use code from Google Authenticator.",
              labelTag: "Secure",
            },
            {
              value: "FIDO",
              label: "Security key or biometric authentication",
              labelDescription:
                "Add a security key or biometric authentication (such as Yubikey or Windows Hello) as an authentication method to your account. Your security key must support the FIDO standard.",
              labelTag: "Secure",
            },
            {
              value: "Phone",
              label: "Phone call",
              labelDescription: "Get a single-use code sent via phone call.",
              labelTag: "Less secure",
            },
            {
              value: "Email",
              label: "Email",
              labelDescription: "Get a single-use code sent via email.",
              labelTag: "Less secure",
            },
          ]}
          selectedRadio={mfaOption}
          errorMessage={mfaOptionError}
          validationStatus={mfaOptionError ? "error" : undefined}
          onBlur={validateMfaOption}
          onChange={setMfaOption}
          // onBlur={validate}
          // validationStatus={error ? "error" : undefined}
          variant="tile"
          // errorMessage={error ? ERROR_MESSAGE : undefined}
        />
        <Button
          className="margin-top-3"
          label={"Continue"}
          type={"submit"}
          onClick={validateMfaOption}
        />
      </Card>
      <p className="margin-top-5">
        <a href="#0">Return to previous step</a>
      </p>
    </CardBackground>
  );
};
