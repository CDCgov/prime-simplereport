import { useState } from "react";

import TextInput from "../../commonComponents/TextInput";
import Button from "../../commonComponents/Button/Button";

interface Props {
  resendCode?: boolean;
}

export const MfaVerifyForm = (props: Props) => {
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const resendCode = props.resendCode;

  const validateCode = () => {
    if (code === "") {
      setCodeError("Enter your security code");
    } else {
      setCodeError("");
    }
  };

  return (
    <>
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
        className="margin-top-3"
        label={"Submit"}
        type={"submit"}
        onClick={validateCode}
      />
      {resendCode && (
        <>
          <p className="margin-top-4 margin-bottom-0">
            Didn't get your security code?
          </p>
          <Button
            className="usa-button--unstyled margin-top-105"
            label={"Send another code"}
            type={"submit"}
          />
        </>
      )}
    </>
  );
};
