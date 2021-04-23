import { useState } from "react";

import { Card } from "../commonComponents/Card";
import { CardBackground } from "../commonComponents/CardBackground";
import Button from "../commonComponents/Button";
import StepIndicator from "../commonComponents/StepIndicator";

export const Authentication = () => {
  return (
    <CardBackground>
      <Card logo>
        <h1 className="font-ui-sm margin-top-3">Set up your account</h1>
        <p>[ step indicator ]</p>
        <p className="usa-hint">Add a second layer of security to protect your account.</p>
        <p>[ radio buttons ]</p>
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
