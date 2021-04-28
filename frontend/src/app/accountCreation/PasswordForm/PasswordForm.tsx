import { ChangeEvent, useState } from "react";

import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import TextInput from "../../commonComponents/TextInput";
import Button from "../../commonComponents/Button";
import StepIndicator from "../../commonComponents/StepIndicator";
import { accountCreationSteps } from "../../../config/constants";
import {
  hasLowerCase,
  hasNumber,
  hasSymbol,
  hasUpperCase,
  isAtLeast15Chars,
} from "../../utils/text";

export const PasswordForm = () => {
  const [password, setPassword] = useState("");
  const [strength, setStrength] = useState(0);
  const [error] = useState("");

  const calculateStrength = (value: string): number =>
    [
      hasLowerCase,
      hasUpperCase,
      hasNumber,
      hasSymbol,
      isAtLeast15Chars,
    ].filter((f) => f(value)).length;

  const handleChange = ({
    target: { value },
  }: ChangeEvent<HTMLInputElement>) => {
    setPassword(value);
    setStrength(calculateStrength(value));
  };

  let strengthLabel, strengthColor: string;
  switch (strength) {
    case 1:
    case 2:
      strengthLabel = "Weak";
      strengthColor = "bg-error";
      break;
    case 3:
      strengthLabel = "Weak";
      strengthColor = "bg-orange";
      break;
    case 4:
      strengthLabel = "Okay";
      strengthColor = "bg-gold";
      break;
    case 5:
      strengthLabel = "Good";
      strengthColor = "bg-success";
      break;
    default:
      strengthLabel = "...";
      strengthColor = "bg-base-lighter";
  }

  const strengthBars = [1, 3, 4, 5].map((score) => {
    const margin = score === 1 ? "" : "margin-left-1";
    const color = strength >= score ? strengthColor : "bg-base-lighter";
    return <div className={`height-1 width-full ${margin} ${color}`}></div>;
  });

  return (
    <CardBackground>
      <Card logo bodyKicker="Set up your account">
        <StepIndicator
          steps={accountCreationSteps}
          currentStepValue={"0"}
          noLabels={true}
        />
        <TextInput
          label={"Password"}
          name={"password"}
          type={"password"}
          value={password}
          hintText="Your password must be at least 15 characters, include an uppercase and lowercase letter, a number, and a symbol."
          errorMessage="this is an error"
          validationStatus={error ? "error" : undefined}
          onChange={handleChange}
        />
        <div className="display-flex grid-gap margin-top-105">
          {strengthBars}
        </div>
        <p className="font-ui-3xs">
          Password strength: <span>{strengthLabel}</span>
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
