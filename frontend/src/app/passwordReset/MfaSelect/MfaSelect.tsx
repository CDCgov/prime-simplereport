import { useEffect, useState } from "react";

import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import TextInput from "../../commonComponents/TextInput";
import Button from "../../commonComponents/Button/Button";
import RadioGroup from "../../commonComponents/RadioGroup";

export const MfaSelect = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [formIsDirty, setFormIsDirty] = useState(false);
  const [mfaOption, setMfaOption] = useState("");
  const [mfaOptionError, setMfaOptionError] = useState("");

  const emailIsValid = (emailAddress: string) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(emailAddress).toLowerCase());
  };

  const validateEmail = () => {
    setFormIsDirty(true);
    if (!email) {
      setEmailError("Enter your email address");
      return;
    }
    let valid;
    try {
      valid = emailIsValid(email);
    } catch (e) {
      valid = false;
    }
    if (!valid) {
      setEmailError("Enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = () => {
    validateEmail();
  };

  useEffect(() => {
    if (formIsDirty) {
      validateEmail();
    }
  });

  const validateMfaOption = () => {
    if (mfaOption === "") {
      setMfaOptionError("Select an authentication option");
    } else {
      setMfaOptionError("");
    }
  };

  return (
    <CardBackground>
      <Card logo>
        <h1 className="font-ui-sm margin-top-3">Reset your password</h1>
        <p>Confirm your email address to reset your password.</p>
        <TextInput
          label={"Email address"}
          name={"email"}
          type={"email"}
          required
          value={email}
          errorMessage={emailError}
          validationStatus={emailError ? "error" : undefined}
          onBlur={validateEmail}
          onChange={(evt) => setEmail(evt.target.value)}
        />
        <RadioGroup
          legend="Select your identity verification method"
          buttons={[
            {
              label: "Text message (SMS)",
              value: "sms",
            },
            {
              label: "Okta Verify",
              value: "okta",
            },
            {
              label: "Google authenticator",
              value: "google",
            },
            {
              label: "Security key or biometric authentication",
              value: "key",
            },
            {
              label: "Phone call",
              value: "phone",
            },
            {
              label: "Email",
              value: "email",
            },
          ]}
          selectedRadio={mfaOption}
          errorMessage={mfaOptionError}
          validationStatus={mfaOptionError ? "error" : undefined}
          onBlur={validateMfaOption}
          onChange={setMfaOption}
        ></RadioGroup>
        <p className="usa-hint font-ui-2xs margin-bottom-0">
          Text message and voice call options will only work if you’ve connected
          them to your SimpleReport account.
        </p>
        <Button
          className="margin-top-3"
          label={"Continue"}
          type={"submit"}
          onClick={handleSubmit}
        />
      </Card>
      <p className="margin-top-4">
        <a href="#0">Return to sign in</a>
      </p>
    </CardBackground>
  );
};
