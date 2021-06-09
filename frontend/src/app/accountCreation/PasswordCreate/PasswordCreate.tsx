import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import StepIndicator from "../../commonComponents/StepIndicator";
import { accountCreationSteps } from "../../../config/constants";
import { PasswordForm } from "../PasswordForm/PasswordForm";

export const PasswordCreate = () => (
  <CardBackground>
    <Card logo bodyKicker="Set up your account">
      <StepIndicator
        steps={accountCreationSteps}
        currentStepValue={"0"}
        noLabels={true}
      />
      <PasswordForm />
    </Card>
  </CardBackground>
);
