import { ReactElement } from "react";

import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import StepIndicator from "../../commonComponents/StepIndicator";
import { accountCreationSteps } from "../../../config/constants";
import { MfaVerifyForm } from "../MfaVerifyForm/MfaVerifyForm";

interface Props {
  hint: ReactElement;
}

export const MfaVerify = (props: Props) => {
  return (
    <CardBackground>
      <Card logo bodyKicker="Set up your account">
        <StepIndicator
          steps={accountCreationSteps}
          currentStepValue={"2"}
          noLabels={true}
        />
        <p className="margin-bottom-0">Verify your security code.</p>
        <p className="usa-hint font-ui-2xs margin-bottom-0">{props.hint}</p>
        <MfaVerifyForm buttonCode />
      </Card>
      <p className="margin-top-4">
        <a href="#0">Return to previous step</a>
      </p>
    </CardBackground>
  );
};
