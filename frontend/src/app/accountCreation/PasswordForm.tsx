import { useState } from "react";

import { CardContainer } from "../commonComponents/CardContainer";
import TextInput from "../commonComponents/TextInput";
import Button from "../commonComponents/Button";
import StepIndicator from "../commonComponents/StepIndicator";

export const PasswordForm = () => {
  const [password, setPassword] = useState("");

  return (
    <CardContainer logo>
      <h1 className="font-ui-sm margin-top-3">Set up your account</h1>
      <p>[ step indicator ]</p>
      <TextInput
        label={"Password"}
        name={"password"}
        type={"password"}
        hintText="Your password must be at least 8 characters and include an uppercase and lowercase letter and a number."
        onChange={(evt) => setPassword(evt.currentTarget.value)}
      />
      <p>[ password strength ] todo: verify w/ team</p>
      <TextInput
        label={"Confirm password"}
        name={"confirm-password"}
        type={"password"}
        onChange={(evt) => setPassword(evt.currentTarget.value)}
      />
      <Button
        className="margin-top-3"
        id="dob-submit-button"
        label={"Continue"}
        type={"submit"}
      />
    </CardContainer>
  );
};
