import { useEffect, useState } from "react";

import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import TextInput from "../../commonComponents/TextInput";
import Button from "../../commonComponents/Button/Button";

export const Email = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [formIsDirty, setFormIsDirty] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const emailIsValid = (emailAddress: string) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(emailAddress).toLowerCase());
  };

  const validateEmail = () => {
    setFormIsDirty(true);
    if (!email) {
      setEmailError("Enter your email address");
      return;
    }
    let valid;
    try {
      valid = emailIsValid(email);
    } catch (e) {
      valid = false;
    }
    if (!valid) {
      setEmailError("Enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = () => {
    validateEmail();
  };

  useEffect(() => {
    if (formIsDirty) {
      validateEmail();
    }
  });

  const validatePassword = (): boolean => {
    let error = "";
    if (password === "") {
      error = "Enter a password";
    }
    setPasswordError(error);
    return error === "";
  };

  return (
    <CardBackground>
      <Card logo>
        <h1 className="font-ui-sm margin-top-3">Set up your account</h1>
        <TextInput
          label={"Email address"}
          name={"email"}
          type={"email"}
          required
          value={email}
          errorMessage={emailError}
          validationStatus={emailError ? "error" : undefined}
          onBlur={validateEmail}
          onChange={(evt) => setEmail(evt.target.value)}
        />
        <TextInput
          label={"Password"}
          name={"password"}
          type={"password"}
          value={password}
          required
          errorMessage={passwordError}
          validationStatus={passwordError ? "error" : undefined}
          onBlur={validatePassword}
          onChange={(evt) => setPassword(evt.currentTarget.value)}
        />
        <Button
          className="margin-top-3"
          label={"Sign in"}
          type={"submit"}
          onClick={handleSubmit}
        />
      </Card>
      <p className="margin-top-4">
        <a href="#0">Forgot your password?</a>
      </p>
    </CardBackground>
  );
};
