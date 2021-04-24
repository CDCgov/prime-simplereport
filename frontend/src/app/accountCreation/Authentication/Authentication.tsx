import { useState } from "react";

import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import Button from "../../commonComponents/Button";
import StepIndicator from "../../commonComponents/StepIndicator";

export const Authentication = () => {
  return (
    <CardBackground>
      <Card logo bodyHeading="Set up your account">
        <p>[ step indicator ]</p>
        <p className="usa-hint">
          Add a second layer of security to protect your account.
        </p>
        <p>[ radio buttons ]</p>
        <Button className="margin-top-3" label={"Continue"} type={"submit"} />
      </Card>
      <p className="margin-top-5">
        <a href="#0">Return to previous step</a>
      </p>
    </CardBackground>
  );
};
