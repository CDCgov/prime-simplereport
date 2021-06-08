import { useEffect, useState } from "react";

import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import TextInput from "../../commonComponents/TextInput";
import Button from "../../commonComponents/Button/Button";
import { emailIsValid } from "../../utils/email";

export const EmailConfirm = () => {
  const [emailAddress, setEmailAddress] = useState("");
  const [emailError, setEmailError] = useState("");
  const [formIsDirty, setFormIsDirty] = useState(false);

  const validateEmail = () => {
    setFormIsDirty(true);
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

  const handleSubmit = () => {
    validateEmail();
  };

  useEffect(() => {
    if (formIsDirty) {
      validateEmail();
    }
  });

  return (
    <CardBackground>
      <Card logo>
        <h1 className="font-ui-sm margin-top-3">Reset your password</h1>
        <p>Confirm your email address to reset your password.</p>
        <TextInput
          label={"Email address"}
          name={"email"}
          type={"email"}
          value={emailAddress}
          errorMessage={emailError}
          validationStatus={emailError ? "error" : undefined}
          onBlur={validateEmail}
          onChange={(evt) => setEmailAddress(evt.target.value)}
        />
        <Button
          className="margin-top-3"
          label={"Continue"}
          type={"submit"}
          onClick={handleSubmit}
        />
      </Card>
      <p className="margin-top-4">
        <a href="#0">Return to sign in</a>
      </p>
    </CardBackground>
  );
};
