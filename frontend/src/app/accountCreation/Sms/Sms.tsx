import { useState } from "react";

import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import TextInput from "../../commonComponents/TextInput";
import Button from "../../commonComponents/Button";
import StepIndicator from "../../commonComponents/StepIndicator";

export const Sms = () => {
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  return (
    <CardBackground>
      <Card logo bodyHeading="Set up your account">
        <p>[ step indicator ]</p>
        <p>Get your security code via text message (SMS).</p>
        <p className="usa-hint">
          We’ll send you a security code each time you sign in.
        </p>
        <p className="usa-hint">
          Message and data rates may apply. Not compatible with web-based (VOIP)
          phone services like Google Voice.
        </p>
        <TextInput
          label={"Phone number"}
          name={"phone-number"}
          type={"tel"}
          errorMessage="this is an error"
          validationStatus={passwordError ? "error" : undefined}
          onChange={(evt) => setPassword(evt.currentTarget.value)}
        />
        <Button className="margin-top-3" label={"Send code"} type={"submit"} />
      </Card>
      <p className="margin-top-5">
        <a href="#0">Return to previous step</a>
      </p>
    </CardBackground>
  );
};
