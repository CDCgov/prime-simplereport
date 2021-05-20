import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import { PasswordForm } from "../../accountCreation/PasswordForm/PasswordForm";

export const PasswordReset = () => (
  <CardBackground>
    <Card logo>
      <h1 className="font-ui-sm margin-top-3">Reset your password</h1>
      <PasswordForm />
    </Card>
    <p className="margin-top-4">
      <a href="#0">Return to sign in</a>
    </p>
  </CardBackground>
);
