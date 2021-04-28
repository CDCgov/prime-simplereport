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
} from "../../utils/text";

export const PasswordForm = () => {
  const [password, setPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordError, setPasswordError] = useState("");

  const calculatePasswordStrength = (value: string): number => {
    let strength = 0;
    if (hasLowerCase(value)) strength++;
    if (hasUpperCase(value)) strength++;
    if (hasNumber(value)) strength++;
    if (hasSymbol(value)) strength++;
    if (value.length >= 15) strength++;
    return strength;
  };

  const handleChange = ({
    target: { value },
  }: ChangeEvent<HTMLInputElement>) => {
    setPassword(value);
    setPasswordStrength(calculatePasswordStrength(value));
  };

  let passwordStrengthLabel, passwordStrengthColor;
  switch (passwordStrength) {
    case 1:
    case 2:
      passwordStrengthLabel = "Weak";
      passwordStrengthColor = "bg-error";
      break;
    case 3:
      passwordStrengthLabel = "Weak";
      passwordStrengthColor = "bg-orange";
      break;
    case 4:
      passwordStrengthLabel = "Okay";
      passwordStrengthColor = "bg-gold";
      break;
    case 5:
      passwordStrengthLabel = "Good";
      passwordStrengthColor = "bg-success";
      break;
    default:
      passwordStrengthLabel = "...";
      passwordStrengthColor = "bg-base-lighter";
  }

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
          validationStatus={passwordError ? "error" : undefined}
          onChange={handleChange}
        />
        <div className="display-flex grid-gap margin-top-105">
          <div
            className={`height-1 width-full ${
              passwordStrength >= 1 ? passwordStrengthColor : "bg-base-lighter"
            }`}
          ></div>
          <div
            className={`height-1 width-full margin-left-1 ${
              passwordStrength >= 3 ? passwordStrengthColor : "bg-base-lighter"
            }`}
          ></div>
          <div
            className={`height-1 width-full margin-left-1 ${
              passwordStrength >= 4 ? passwordStrengthColor : "bg-base-lighter"
            }`}
          ></div>
          <div
            className={`height-1 width-full margin-left-1 ${
              passwordStrength >= 5 ? passwordStrengthColor : "bg-base-lighter"
            }`}
          ></div>
        </div>
        <p className="font-ui-3xs">
          Password strength: <span>{passwordStrengthLabel}</span>
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
