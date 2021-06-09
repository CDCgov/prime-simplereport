import { ReactElement, useState } from "react";
import { Redirect } from "react-router";

import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import TextInput from "../../commonComponents/TextInput";
import Button from "../../commonComponents/Button/Button";
import StepIndicator from "../../commonComponents/StepIndicator";
import { accountCreationSteps } from "../../../config/constants";
import { AccountCreationApi } from "../AccountCreationApiService";
import Alert from "../../commonComponents/Alert";
import { LoadingCard } from "../LoadingCard/LoadingCard";

interface Props {
  hint: ReactElement;
  hideResend?: boolean;
}

export const MfaVerify = (props: Props) => {
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [codeResendSuccess, setCodeResendSuccess] = useState(false);

  const validateCode = () => {
    let error = "";
    if (code === "") {
      error = "Enter your security code";
    }
    setCodeError(error);
    setCodeResendSuccess(false);
    return error === "";
  };

  const resendCode = async () => {
    try {
      await AccountCreationApi.resendActivationPasscode();
      setCodeResendSuccess(true);
    } catch (error) {
      setCodeError(`API Error: ${error?.message}`);
    }
  };

  const handleSubmit = async () => {
    if (validateCode()) {
      setLoading(true);
      try {
        await AccountCreationApi.verifyActivationPasscode(code);
        setSubmitted(true);
      } catch (error) {
        setCodeError(`API Error: ${error?.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return <LoadingCard message="Validating code..." />;
  }

  if (submitted) {
    return <Redirect to="/success" />;
  }

  const input = (
    <TextInput
      className="flex-fill"
      label={"One-time security code"}
      name={"security-code"}
      type={"tel"}
      value={code}
      errorMessage={codeError}
      validationStatus={codeError ? "error" : undefined}
      onBlur={validateCode}
      onChange={(evt) => setCode(evt.currentTarget.value)}
    />
  );

  const inlineSubmitButton = (
    <Button
      className="margin-top-3 flex-align-self-end margin-left-1"
      label={"Submit"}
      type={"submit"}
      onClick={handleSubmit}
    />
  );

  const submitButton = (
    <Button
      className="margin-top-3"
      label={"Submit"}
      type={"submit"}
      onClick={handleSubmit}
    />
  );

  return (
    <CardBackground>
      <Card logo bodyKicker="Set up your account">
        <StepIndicator
          steps={accountCreationSteps}
          currentStepValue={"2"}
          noLabels={true}
        />
        {codeResendSuccess ? (
          <Alert
            type="success"
            title="Verification code resent"
            body="Another code has been sent."
          />
        ) : null}
        <p className="margin-bottom-0">Verify your security code.</p>
        <p className="usa-hint font-ui-2xs margin-bottom-0">{props.hint}</p>
        {props.hideResend ? (
          <div className="display-flex">
            {input}
            {inlineSubmitButton}
          </div>
        ) : (
          <>
            {input}
            {submitButton}
            <p className="margin-top-4 margin-bottom-0">
              Didn't get your security code?
            </p>
            <Button
              className="usa-button--unstyled margin-top-105"
              label={"Send another code"}
              type={"submit"}
              onClick={resendCode}
            />
          </>
        )}
      </Card>
      <p className="margin-top-4">
        <a href="#0">Return to previous step</a>
      </p>
    </CardBackground>
  );
};
