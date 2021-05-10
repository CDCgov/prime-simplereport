import { ChangeEvent, useState } from "react";

import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import TextInput from "../../commonComponents/TextInput";
import Button from "../../commonComponents/Button/Button";
import StepIndicator from "../../commonComponents/StepIndicator";
import { accountCreationSteps } from "../../../config/constants";
import {
  hasLowerCase,
  hasNumber,
  hasUpperCase,
  isAtLeast8Chars,
} from "../../utils/text";

export const PasswordForm = () => {
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [strength, setStrength] = useState(0);
  const [strengthHint, setStrengthHint] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordConfirmationError, setPasswordConfirmationError] = useState(
    ""
  );

  const requirements = [hasLowerCase, hasUpperCase, hasNumber, isAtLeast8Chars];

  const missingRequirements = (value: string): Function[] =>
    requirements.filter((f) => !f(value));

  const matchedRequirements = (value: string): Function[] =>
    requirements.filter((f) => f(value));

  const buildHint = (value: string): string => {
    const needs = missingRequirements(value);
    if (needs.length) {
      const hints = [];
      if (needs.includes(isAtLeast8Chars)) {
        hints.push("at least 8 characters");
      }
      if (needs.includes(hasLowerCase)) {
        hints.push("a lowercase letter");
      }
      if (needs.includes(hasUpperCase)) {
        hints.push("an uppercase letter");
      }
      if (needs.includes(hasNumber)) {
        hints.push("a number");
      }
      if (hints.length === 1) {
        return "Your password must have " + hints[0];
      } else if (hints.length >= 3) {
        return `Your password must have ${hints.slice(0, -1).join(", ")}, and  ${
        hints[hints.length - 1]
        }`;
      } else if (hints > 0) {
        return `Your password must have ${hints.slice(0, -1).join(", ")} and ${
        hints[hints.length - 1]
      }`;
      } else {
      return "";
      }
        return "Your password must have " + hints[0];
      } else if (hints.length >= 3) {
        return `Your password must have ${hints.slice(0, -1).join(", ")}, and ${
          hints[hints.length - 1]
        }`;
      } else {
        return `Your password must have ${hints.slice(0, -1).join(", ")} and ${
          hints[hints.length - 1]
        }`;
      }
    }
    return "";
  };

  const calculateStrength = (value: string): number => {
    setStrengthHint(buildHint(value));
    return matchedRequirements(value).length;
  };

  const handleChange = ({
    target: { value },
  }: ChangeEvent<HTMLInputElement>) => {
    setPassword(value);
    setStrength(calculateStrength(value));
  };

  const validatePassword = () => {
    setStrengthHint("");
    setPasswordError(buildHint(password));
  };

  const validatePasswordConfirmation = () => {
    if (password !== passwordConfirmation) {
      setPasswordConfirmationError("Passwords must match");
    } else {
      setPasswordConfirmationError("");
    }
  };

  const handleSubmit = () => {
    validatePassword();
    validatePasswordConfirmation();
  };

  let strengthLabel, strengthColor: string;
  switch (strength) {
    case 1:
      strengthLabel = "Weak";
      strengthColor = "bg-error";
      break;
    case 2:
      strengthLabel = "Weak";
      strengthColor = "bg-orange";
      break;
    case 3:
      strengthLabel = "Okay";
      strengthColor = "bg-gold";
      break;
    case 4:
      strengthLabel = "Good";
      strengthColor = "bg-success";
      break;
    default:
      strengthLabel = "...";
      strengthColor = "bg-base-lighter";
  }

  const strengthBars = [1, 2, 3, 4].map((score) => {
    const margin = score === 1 ? "" : "margin-left-1";
    const color = strength >= score ? strengthColor : "bg-base-lighter";
    return (
      <div
        key={score}
        className={`height-1 width-full ${margin} ${color}`}
      ></div>
    );
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
          hintText="Your password must be at least 8 characters, include an uppercase and lowercase letter, and a number."
          required
          errorMessage={passwordError}
          validationStatus={passwordError ? "error" : undefined}
          onBlur={validatePassword}
          onChange={handleChange}
        />
        <div className="display-flex grid-gap margin-top-105">
          {strengthBars}
        </div>
        <p className="font-ui-3xs margin-bottom-0 text-base">
          Password strength: <span className="text-bold">{strengthLabel}</span>
        </p>
        <p className="font-ui-3xs margin-top-05 line-height-sans-3 text-base">
          {strengthHint}
        </p>
        <TextInput
          label={"Confirm password"}
          name={"confirm-password"}
          type={"password"}
          value={passwordConfirmation}
          required
          errorMessage={passwordConfirmationError}
          validationStatus={passwordConfirmationError ? "error" : undefined}
          onBlur={validatePasswordConfirmation}
          onChange={(evt) => setPasswordConfirmation(evt.currentTarget.value)}
        />
        <Button
          className="margin-top-3"
          label={"Continue"}
          type={"submit"}
          onClick={handleSubmit}
        />
      </Card>
    </CardBackground>
  );
};
