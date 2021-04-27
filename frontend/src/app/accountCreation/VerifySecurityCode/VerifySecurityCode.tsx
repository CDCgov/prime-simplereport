import { useState } from "react";

import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import TextInput from "../../commonComponents/TextInput";
import Button from "../../commonComponents/Button";
import StepIndicator from "../../commonComponents/StepIndicator";

export const VerifySecurityCode = () => {
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  return (
    <CardBackground>
      <Card logo bodyKicker="Set up your account">
        <p>[ step indicator ]</p>
        <p className="margin-bottom-0">Verify your security code.</p>
        <p className="usa-hint font-ui-2xs">
          We’ve sent a text message (SMS) to <b>(213) 555-2424</b>. It will
          expire in 10 minutes.{" "}
        </p>
        <TextInput
          label={"One-time security code"}
          name={"security-code"}
          type={"tel"}
          errorMessage="this is an error"
          validationStatus={passwordError ? "error" : undefined}
          onChange={(evt) => setPassword(evt.currentTarget.value)}
        />
        <Button className="margin-top-3" label={"Verify"} type={"submit"} />
        <Button
          className="usa-button--outline display-block margin-top-3"
          label={"Send another code"}
          type={"submit"}
        />
      </Card>
      <p className="margin-top-5">
        <a href="#0">Return to previous step</a>
      </p>
    </CardBackground>
  );
};
