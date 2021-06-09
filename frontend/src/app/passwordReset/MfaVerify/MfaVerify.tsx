import { ReactElement } from "react";

import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import { MfaVerifyForm } from "../../accountCreation/MfaVerifyForm/MfaVerifyForm";

interface Props {
  hint: ReactElement;
  type: string;
  resendCode?: boolean;
}

export const MfaVerify = (props: Props) => {
  return (
    <CardBackground>
      <Card logo>
        <h1 className="font-ui-sm margin-top-3">Verify via {props.type}</h1>
        <p className="usa-hint margin-bottom-0 line-height-sans-3">
          {props.hint}
        </p>
        <MfaVerifyForm resendCode={props.resendCode} />
      </Card>
      <p className="margin-top-4">
        <a href="#0">Return to sign in</a>
      </p>
    </CardBackground>
  );
};
