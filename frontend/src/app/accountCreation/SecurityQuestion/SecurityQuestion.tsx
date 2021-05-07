import { useState } from "react";

import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import Dropdown from "../../commonComponents/Dropdown";
import TextInput from "../../commonComponents/TextInput";
import Button from "../../commonComponents/Button/Button";
import StepIndicator from "../../commonComponents/StepIndicator";
import {
  accountCreationSteps,
  securityQuestions,
} from "../../../config/constants";

export const SecurityQuestion = () => {
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityQuestionError, setSecurityQuestionError] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [securityAnswerError, setSecurityAnswerError] = useState("");

  const validateSecurityQuestion = () => {
    if (securityQuestion === "") {
      setSecurityQuestionError("Enter a security question");
    } else {
      setSecurityQuestionError("");
    }
  };

  const validateSecurityAnswer = () => {
    if (securityAnswer === "") {
      setSecurityAnswerError("Enter a security answer");
    } else {
      setSecurityAnswerError("");
    }
  };

  const handleSubmit = () => {
    validateSecurityQuestion();
    validateSecurityAnswer();
  };

  return (
    <CardBackground>
      <Card logo bodyKicker="Set up your account">
        <StepIndicator
          steps={accountCreationSteps}
          currentStepValue={"1"}
          noLabels={true}
        />
        <Dropdown
          label="Security question"
          name="security-question"
          hintText="If you forget your password, we’ll ask you this question to verify your identity."
          required
          selectedValue={securityQuestion}
          options={securityQuestions.map((c) => ({ label: c, value: c }))}
          defaultSelect
          className="usa-input--medium"
          errorMessage={securityQuestionError}
          validationStatus={securityQuestionError ? "error" : undefined}
          onBlur={validateSecurityQuestion}
          onChange={(evt) => setSecurityQuestion(evt.target.value)}
        />
        <TextInput
          label={"Answer"}
          name={"answer"}
          value={securityAnswer}
          required
          errorMessage={securityAnswerError}
          validationStatus={securityAnswerError ? "error" : undefined}
          onBlur={validateSecurityAnswer}
          onChange={(evt) => setSecurityAnswer(evt.target.value)}
        />
        <Button
          className="margin-top-3"
          label={"Continue"}
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
