import { ReactElement, useState } from "react";
import { Redirect } from "react-router";

import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import TextInput from "../../commonComponents/TextInput";
import Button from "../../commonComponents/Button/Button";
import StepIndicator from "../../commonComponents/StepIndicator";
import { accountCreationSteps } from "../../../config/constants";
// import { MfaVerifyForm } from "../MfaVerifyForm/MfaVerifyForm";
import { AccountCreationApi } from "../AccountCreationApiService";
import Alert from "../../commonComponents/Alert";

interface Props {
  hint: ReactElement;
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
    return (
      <main>
        <div className="grid-container maxw-tablet">
          <p className="margin-top-3">Validating code...</p>
        </div>
      </main>
    );
  }

  if (submitted) {
    return <Redirect to="/success" />;
  }

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
        <div className="display-flex">
          <TextInput
            className="flex-fill"
            label={"One-time security code"}
            name={"security-code"}
            type={"tel"}
            required
            value={code}
            errorMessage={codeError}
            validationStatus={codeError ? "error" : undefined}
            onBlur={validateCode}
            onChange={(evt) => setCode(evt.currentTarget.value)}
          />
          <Button
            className="margin-top-3 flex-align-self-end margin-left-1"
            label={"Submit"}
            type={"submit"}
            onClick={handleSubmit}
          />
        </div>
        <Button
          className="usa-button--outline display-block margin-top-3"
          label={"Send another code"}
          type={"submit"}
          onClick={resendCode}
        />
      </Card>
      <p className="margin-top-4">
        <a href="#0">Return to previous step</a>
      </p>
    </CardBackground>
  );
};
