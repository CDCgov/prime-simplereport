import { ReactElement, useState } from "react";

import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import TextInput from "../../commonComponents/TextInput";
import Button from "../../commonComponents/Button/Button";
import StepIndicator from "../../commonComponents/StepIndicator";
import { accountCreationSteps } from "../../../config/constants";

interface Props {
  hint: ReactElement;
}

export const MfaVerify = (props: Props) => {
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");

  const validateCode = () => {
    if (code === "") {
      setCodeError("Enter your security code");
    } else {
      setCodeError("");
    }
  };

  return (
    <CardBackground>
      <Card logo bodyKicker="Set up your account">
        <StepIndicator
          steps={accountCreationSteps}
          currentStepValue={"2"}
          noLabels={true}
        />
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
            label={"Verify"}
            type={"submit"}
            onClick={validateCode}
          />
        </div>
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
