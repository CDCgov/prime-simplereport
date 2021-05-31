import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import { MfaVerifyForm } from "../../accountCreation/MfaVerifyForm/MfaVerifyForm";

export const MfaAuthenticationApp = () => {
  return (
    <CardBackground>
      <Card logo>
        <h1 className="font-ui-sm margin-top-3">
          Enter your authentication code
        </h1>
        <p className="usa-hint margin-bottom-0 line-height-sans-3">
          Enter the security code sent from Google Authenticator or Okta Verify.
        </p>
        <MfaVerifyForm />
      </Card>
      <p className="margin-top-4">
        <a href="#0">Choose another authentication method</a>
      </p>
      <p>
        <a href="#0">Return to sign in</a>
      </p>
    </CardBackground>
  );
};
