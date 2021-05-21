import { useState } from "react";

import TextInput from "../../commonComponents/TextInput";
import Button from "../../commonComponents/Button/Button";

interface Props {
  buttonCode?: boolean;
}

export const MfaVerifyForm = (props: Props) => {
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const buttonCode = props.buttonCode;

  const validateCode = () => {
    if (code === "") {
      setCodeError("Enter your security code");
    } else {
      setCodeError("");
    }
  };

  return (
    <>
      <div className="display-flex">
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
        <Button
          className="margin-top-3 flex-align-self-end margin-left-1"
          label={"Submit"}
          type={"submit"}
          onClick={validateCode}
        />
      </div>
      {buttonCode && (
        <Button
          className="usa-button--outline display-block margin-top-3"
          label={"Send another code"}
          type={"submit"}
        />
      )}
    </>
  );
};
