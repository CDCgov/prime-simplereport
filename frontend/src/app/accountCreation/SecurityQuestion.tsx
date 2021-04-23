import { useState } from "react";

import { Card } from "../commonComponents/Card";
import { CardBackground } from "../commonComponents/CardBackground";
import Dropdown from "../commonComponents/Dropdown";
import TextInput from "../commonComponents/TextInput";
import Button from "../commonComponents/Button";
import StepIndicator from "../commonComponents/StepIndicator";
import { stateCodes } from "../../config/constants";

export const SecurityQuestion = () => {
  const [password, setPassword] = useState("");

  return (
    <CardBackground>
      <Card logo>
        <h1 className="font-ui-sm margin-top-3">Set up your account</h1>
        <p>[ step indicator ]</p>
        <Dropdown
          label="Security question"
          name="security-question"
          selectedValue={"string"}
          options={stateCodes.map((c) => ({ label: c, value: c }))}
          defaultSelect
          className="usa-input--medium"
          onChange={(evt) => setPassword(evt.currentTarget.value)}
        />
        <TextInput
          label={"Answer"}
          name={"answer"}
          onChange={(evt) => setPassword(evt.currentTarget.value)}
        />
        <Button
          className="margin-top-3"
          id="dob-submit-button"
          label={"Continue"}
          type={"submit"}
        />
      </Card>
      <p className="margin-top-5">
        <a href="#0">Return to previous step</a>
      </p>
    </CardBackground>
  );
};
