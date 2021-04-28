import { useState } from "react";

import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import Dropdown from "../../commonComponents/Dropdown";
import TextInput from "../../commonComponents/TextInput";
import Button from "../../commonComponents/Button";
import StepIndicator from "../../commonComponents/StepIndicator";
import { accountCreationSteps, stateCodes } from "../../../config/constants";

export const SecurityQuestion = () => {
  const [password, setPassword] = useState("");

  return (
    <CardBackground>
      <Card logo bodyKicker="Set up your account">
        <StepIndicator
          steps={accountCreationSteps}
          currentStepValue={"1"}
          noLabels={true}
        />
        <Dropdown
          label="Security question"
          name="security-question"
          hintText="If you forget your password, we’ll ask you this question to verify your identity."
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
        <Button className="margin-top-3" label={"Continue"} type={"submit"} />
      </Card>
      <p className="margin-top-5">
        <a href="#0">Return to previous step</a>
      </p>
    </CardBackground>
  );
};
