import { useState } from "react";

import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import Button from "../../commonComponents/Button";
import RadioGroup from "../../commonComponents/RadioGroup";
import StepIndicator from "../../commonComponents/StepIndicator";
import { accountCreationSteps } from "../../../config/constants";

export const Authentication = () => {
  const [password, setPassword] = useState("");

  return (
    <CardBackground>
      <Card logo bodyKicker="Set up your account">
        <StepIndicator
          steps={accountCreationSteps}
          currentStepValue={"2"}
          noLabels={true}
        />
        <RadioGroup
          name="addressSelect"
          hintText="Add a second layer of security to protect your account."
          buttons={[
            {
              value: "value",
              label: "Text message (SMS)",
            },
            {
              value: "value2",
              label: "Okta Verify",
            },
          ]}
          // selectedRadio={selectedAddress}
          onChange={setPassword}
          // onBlur={validate}
          // validationStatus={error ? "error" : undefined}
          variant="tile"
          // errorMessage={error ? ERROR_MESSAGE : undefined}
          labelDescription="Get a single-use code sent via text message (SMS)."
          labelTag="Less secure"
        />
        <Button className="margin-top-3" label={"Continue"} type={"submit"} />
      </Card>
      <p className="margin-top-5">
        <a href="#0">Return to previous step</a>
      </p>
    </CardBackground>
  );
};
