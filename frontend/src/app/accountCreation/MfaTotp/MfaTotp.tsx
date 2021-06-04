import { useEffect, useState } from "react";

import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import Button from "../../commonComponents/Button/Button";
import StepIndicator from "../../commonComponents/StepIndicator";
import { accountCreationSteps } from "../../../config/constants";
import iconLoader from "../../../../node_modules/uswds/dist/img/loader.svg";
import { LoadingCard } from "../LoadingCard/LoadingCard";

interface Props {
  enrollFunction: Function;
  totpType: string;
}

export const MfaTotp = (props: Props) => {
  const [qrCode, setQrCode] = useState("");

  useEffect(() => {
    const getQrCode = async () => {
      const { qrcode } = await props.enrollFunction();
      setQrCode(qrcode);
    };
    getQrCode();
  }, [props]);

  if (!qrCode) {
    return <LoadingCard message="Retrieving QR code..." />;
  }

  return (
    <CardBackground>
      <Card logo bodyKicker="Set up your account">
        <StepIndicator
          steps={accountCreationSteps}
          currentStepValue={"2"}
          noLabels={true}
        />
        <p className="margin-bottom-0">
          Get your security code via the {props.totpType} application.
        </p>
        <p className="usa-hint font-ui-2xs">
          To connect SimpleReport to {props.totpType}, scan this QR code in the
          app.
        </p>
        <div className="display-flex flex-column flex-align-center">
          {qrCode ? (
            <img src={qrCode} alt="TOTP QR Code" className="height-card" />
          ) : (
            <img
              className="square-5 chromatic-ignore"
              src={iconLoader}
              alt=""
            />
          )}
        </div>
        <Button className="margin-top-3" label={"Continue"} type={"submit"} />
      </Card>
      <p className="margin-top-5">
        <a href="#0">Return to previous step</a>
      </p>
    </CardBackground>
  );
};
