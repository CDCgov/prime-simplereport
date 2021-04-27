import { useState } from "react";

import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import TextInput from "../../commonComponents/TextInput";
import Button from "../../commonComponents/Button";
import StepIndicator from "../../commonComponents/StepIndicator";

export const PasswordForm = () => {
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  return (
    <CardBackground>
      <Card logo bodyKicker="Set up your account">
        <p>[ step indicator ]</p>
        <TextInput
          label={"Password"}
          name={"password"}
          type={"password"}
          hintText="Your password must be at least 8 characters and include an uppercase and lowercase letter and a number."
          errorMessage="this is an error"
          validationStatus={passwordError ? "error" : undefined}
          onChange={(evt) => setPassword(evt.currentTarget.value)}
        />
        <div className="display-flex grid-gap margin-top-105">
          <div className="height-1 width-full bg-base-lighter"></div>
          <div className="height-1 width-full bg-base-lighter margin-left-1"></div>
          <div className="height-1 width-full bg-base-lighter margin-left-1"></div>
          <div className="height-1 width-full bg-base-lighter margin-left-1"></div>
        </div>
        <p className="font-ui-3xs">
          Password strength: <span>Weak</span>
        </p>
        <TextInput
          label={"Confirm password"}
          name={"confirm-password"}
          type={"password"}
          onChange={(evt) => setPassword(evt.currentTarget.value)}
        />
        <Button className="margin-top-3" label={"Continue"} type={"submit"} />
      </Card>
    </CardBackground>
  );
};
