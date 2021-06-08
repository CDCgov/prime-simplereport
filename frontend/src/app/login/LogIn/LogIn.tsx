import { useEffect, useState } from "react";

import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import TextInput from "../../commonComponents/TextInput";
import Button from "../../commonComponents/Button/Button";
import { emailIsValid } from "../../utils/email";

export const LogIn = () => {
  const [emailAddress, setEmailAddress] = useState("");
  const [emailError, setEmailError] = useState("");
  const [dirty, setDirty] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validateEmailAddress = () => {
    setDirty(true);
    if (!emailAddress) {
      setEmailError("Enter your email address");
      return;
    }
    let valid;
    try {
      valid = emailIsValid(emailAddress);
    } catch (e) {
      valid = false;
    }
    if (!valid) {
      setEmailError("Enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  useEffect(() => {
    if (dirty) {
      validateEmailAddress();
    }
  });

  const validatePassword = (): boolean => {
    let error = "";
    if (password === "") {
      error = "Enter your password";
    }
    setPasswordError(error);
    return error === "";
  };

  return (
    <CardBackground>
      <Card logo>
        <h1 className="font-ui-sm margin-top-3">Log in</h1>
        <TextInput
          label={"Email address"}
          name={"email"}
          type={"email"}
          value={emailAddress}
          errorMessage={emailError}
          validationStatus={emailError ? "error" : undefined}
          onBlur={validateEmailAddress}
          onChange={(evt) => setEmailAddress(evt.target.value)}
        />
        <TextInput
          label={"Password"}
          name={"password"}
          type={"password"}
          value={password}
          errorMessage={passwordError}
          validationStatus={passwordError ? "error" : undefined}
          onBlur={validatePassword}
          onChange={(evt) => setPassword(evt.currentTarget.value)}
        />
        <Button
          className="margin-top-3"
          label={"Log in"}
          type={"submit"}
          onClick={validateEmailAddress}
        />
      </Card>
      <p className="margin-top-4">
        <a href="#0">Forgot your password?</a>
      </p>
    </CardBackground>
  );
};
