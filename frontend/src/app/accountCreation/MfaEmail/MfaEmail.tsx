import { useEffect, useState } from "react";

import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import TextInput from "../../commonComponents/TextInput";
import Button from "../../commonComponents/Button/Button";
import StepIndicator from "../../commonComponents/StepIndicator";
import { accountCreationSteps } from "../../../config/constants";
import { emailIsValid } from "../../utils/email";

export const MfaEmail = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [formIsDirty, setFormIsDirty] = useState(false);

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

  useEffect(() => {
    if (formIsDirty) {
      validateEmail();
    }
  });

  return (
    <CardBackground>
      <Card logo bodyKicker="Set up your account">
        <StepIndicator
          steps={accountCreationSteps}
          currentStepValue={"2"}
          noLabels={true}
        />
        <p className="margin-bottom-0">Get your security code via email.</p>
        <p className="usa-hint font-ui-2xs">
          We’ll send you a security code each time you sign in.
        </p>
        <TextInput
          label={"Email address"}
          name={"email"}
          type={"email"}
          value={email}
          errorMessage={emailError}
          validationStatus={emailError ? "error" : undefined}
          onBlur={validateEmail}
          onChange={(evt) => setEmail(evt.target.value)}
        />
        <Button
          className="margin-top-3"
          label={"Send code"}
          type={"submit"}
          onClick={validateEmail}
        />
      </Card>
      <p className="margin-top-5">
        <a href="#0">Return to previous step</a>
      </p>
    </CardBackground>
  );
};
