import { useState } from "react";

import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import TextInput from "../../commonComponents/TextInput";
import Button from "../../commonComponents/Button";
import StepIndicator from "../../commonComponents/StepIndicator";
import { accountCreationSteps } from "../../../config/constants";

export const Sms = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState("");

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
          errorMessage="this is an error"
          validationStatus={phoneNumberError ? "error" : undefined}
          value={phoneNumber}
          onChange={(evt) => setPhoneNumber(evt.currentTarget.value)}
        />
        <Button className="margin-top-3" label={"Send code"} type={"submit"} />
      </Card>
      <p className="margin-top-5">
        <a href="#0">Return to previous step</a>
      </p>
    </CardBackground>
  );
};
