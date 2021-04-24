import { useState } from "react";

import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import TextInput from "../../commonComponents/TextInput";
import Button from "../../commonComponents/Button";
import StepIndicator from "../../commonComponents/StepIndicator";

export const PasswordForm = () => {
  const [password, setPassword] = useState("");

  return (
    <CardBackground>
      <Card logo bodyHeading="Set up your account">
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
        <Button className="margin-top-3" label={"Continue"} type={"submit"} />
      </Card>
    </CardBackground>
  );
};
