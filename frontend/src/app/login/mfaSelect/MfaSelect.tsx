import { useState } from "react";

import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import Button from "../../commonComponents/Button/Button";
import RadioGroup from "../../commonComponents/RadioGroup";
import { AUTH_OR_IDENTITY_METHODS_BUTTONS } from "../../constants";

export const MfaSelect = () => {
  const [mfaOption, setMfaOption] = useState("");
  const [mfaOptionError, setMfaOptionError] = useState("");

  const validateMfaOption = () => {
    if (mfaOption === "") {
      setMfaOptionError("Select an authentication option");
    } else {
      setMfaOptionError("");
    }
  };

  return (
    <CardBackground>
      <Card logo>
        <RadioGroup
          legend="Select your authentication method"
          buttons={AUTH_OR_IDENTITY_METHODS_BUTTONS}
          selectedRadio={mfaOption}
          errorMessage={mfaOptionError}
          validationStatus={mfaOptionError ? "error" : undefined}
          onBlur={validateMfaOption}
          onChange={setMfaOption}
        />
        <Button
          className="margin-top-3"
          label={"Sign in"}
          type={"submit"}
          onClick={validateMfaOption}
        />
      </Card>
      <p className="margin-top-4">
        <a href="#0">Forgot your password?</a>
      </p>
    </CardBackground>
  );
};
