import { useState } from "react";
import { Redirect } from "react-router";

import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import Button from "../../commonComponents/Button/Button";
import RadioGroup from "../../commonComponents/RadioGroup";
import StepIndicator from "../../commonComponents/StepIndicator";
import { accountCreationSteps } from "../../../config/constants";
import { AccountCreationApi } from "../AccountCreationApiService";

type MfaOptions = "SMS" | "Okta" | "Google" | "FIDO" | "Phone" | "Email" | "";

export const MfaSelect = () => {
  const [mfaOption, setMfaOption] = useState<MfaOptions>("");
  const [mfaOptionError, setMfaOptionError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const validateMfaOption = () => {
    let error = "";
    if (mfaOption === "") {
      error = "Select an authentication option";
    }
    setMfaOptionError(error);
    return error === "";
  };

  const handleSubmit = () => {
    if (validateMfaOption()) {
      setSubmitted(true);
    }
  };

  const lessSecure = "Less secure";
  const secure = "Secure";

  if (submitted) {
    let state;
    switch (mfaOption) {
      case "SMS":
        return <Redirect to="/mfa-sms" />;
      case "Okta":
        state = {
          qrCode: Promise.resolve(AccountCreationApi.enrollTotpMfa("Okta")),
        };
        return <Redirect to={{ pathname: "/mfa-okta-verify", state }} />;
      case "Google":
        state = {
          qrCode: Promise.resolve(AccountCreationApi.enrollTotpMfa("Google")),
        };
        return <Redirect to={{ pathname: "/mfa-google-auth", state }} />;
      case "FIDO":
        state = Promise.resolve(AccountCreationApi.enrollSecurityKeyMfa());
        return <Redirect to={{ pathname: "/mfa-security-key", state }} />;

      case "Phone":
        return <Redirect to="/mfa-phone" />;
      case "Email":
        return <Redirect to="/mfa-email" />;
      default:
        return <Redirect to="/" />;
    }
  }

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
              labelTag: lessSecure,
            },
            {
              value: "Okta",
              label: "Okta Verify",
              labelDescription:
                "Get a push notification sent through the Okta Verify mobile app.",
              labelTag: secure,
            },
            {
              value: "Google",
              label: "Google Authenticator",
              labelDescription:
                "Get a single-use code from the Google Authenticator mobile app.",
              labelTag: secure,
            },
            {
              value: "FIDO",
              label: "Security key or biometric authentication",
              labelDescription: `Add a security key or biometric authentication (such as Yubikey or
                Windows Hello) to your account. Your security key must support the FIDO standard.`,
              labelTag: secure,
            },
            {
              value: "Phone",
              label: "Phone call",
              labelDescription: "Get a single-use code sent via phone call.",
              labelTag: lessSecure,
            },
            {
              value: "Email",
              label: "Email",
              labelDescription: "Get a single-use code sent via email.",
              labelTag: lessSecure,
            },
          ]}
          selectedRadio={mfaOption}
          errorMessage={mfaOptionError}
          validationStatus={mfaOptionError ? "error" : undefined}
          onBlur={validateMfaOption}
          onChange={setMfaOption}
          variant="tile"
        />
        <Button
          className="margin-top-3"
          label={"Continue"}
          type={"submit"}
          onClick={handleSubmit}
        />
      </Card>
      <p className="margin-top-5">
        <a href="#0">Return to previous step</a>
      </p>
    </CardBackground>
  );
};
