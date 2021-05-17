import { useEffect, useState } from "react";

import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import Button from "../../commonComponents/Button/Button";
import RadioGroup from "../../commonComponents/RadioGroup";

export const MfaSelect = () => {
  const [mfa, setMfa] = useState("");

  return (
    <CardBackground>
      <Card logo>
        <RadioGroup
          legend="Select authentication method"
          buttons={[
            {
              label: "Text message (SMS)",
              value: "sms",
            },
            {
              label: "Okta Verify",
              value: "okta",
            },
            {
              label: "Google authenticator",
              value: "google",
            },
            {
              label: "Security key or biometric authentication",
              value: "key",
            },
            {
              label: "Phone call",
              value: "phone",
            },
            {
              label: "Email",
              value: "email",
            },
          ]}
          selectedRadio={mfa}
          onChange={setMfa}
        ></RadioGroup>
        <Button
          className="margin-top-3"
          label={"Sign in"}
          type={"submit"}
          // onClick={handleSubmit}
        />
      </Card>
      <p className="margin-top-4">
        <a href="#0">Forgot your password?</a>
      </p>
    </CardBackground>
  );
};
