import { useEffect, useState } from "react";

import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import TextInput from "../../commonComponents/TextInput";
import Button from "../../commonComponents/Button";
import StepIndicator from "../../commonComponents/StepIndicator";
import { accountCreationSteps } from "../../../config/constants";
import { phoneNumberIsValid } from "../../patients/personSchema";

export const MfaSms = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const [formIsDirty, setFormIsDirty] = useState(false);

  const validatePhoneNumber = () => {
    setFormIsDirty(true);
    if (!phoneNumber) {
      setPhoneNumberError("Enter your phone number");
      return;
    }

    let valid;
    try {
      valid = phoneNumberIsValid(phoneNumber);
    } catch (e) {
      valid = false;
    }

    if (!valid) {
      setPhoneNumberError("Enter a valid phone number");
    } else {
      setPhoneNumberError("");
    }
  };

  const handleSubmit = () => {
    validatePhoneNumber();
  };

  useEffect(() => {
    if (formIsDirty) {
      validatePhoneNumber();
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
        <p className="margin-bottom-0">
          Get your security code via text message (SMS).
        </p>
        <p className="usa-hint font-ui-2xs">
          We’ll send you a security code each time you sign in.
        </p>
        <p className="usa-hint font-ui-2xs">
          Message and data rates may apply. Not compatible with web-based (VOIP)
          phone services like Google Voice.
        </p>
        <TextInput
          label={"Phone number"}
          name={"phone-number"}
          type={"tel"}
          required
          value={phoneNumber}
          errorMessage={phoneNumberError}
          validationStatus={phoneNumberError ? "error" : undefined}
          onBlur={validatePhoneNumber}
          onChange={(evt) => setPhoneNumber(evt.target.value)}
        />
        <Button
          className="margin-top-3"
          label={"Send code"}
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
