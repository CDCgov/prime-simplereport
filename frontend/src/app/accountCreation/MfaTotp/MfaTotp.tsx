import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import Button from "../../commonComponents/Button/Button";
import StepIndicator from "../../commonComponents/StepIndicator";
import { accountCreationSteps } from "../../../config/constants";
import { LoadingCard } from "../../commonComponents/LoadingCard/LoadingCard";

interface Props {
  enrollFunction: () => Promise<{ qrcode: string }>;
  totpType: string;
}

export const MfaTotp = ({ enrollFunction, totpType }: Props) => {
  const [qrCode, setQrCode] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const getQrCode = async () => {
      const { qrcode } = await enrollFunction();
      setQrCode(qrcode);
    };
    getQrCode();
  }, [enrollFunction]);

  if (!qrCode) {
    return <LoadingCard message="Retrieving QR code" />;
  }

  if (submitted) {
    return (
      <Navigate
        to={{ pathname: `${window.location.pathname.split("/uac")[1]}/verify` }}
      />
    );
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
          Get your security code via the {totpType} application.
        </p>
        <p className="usa-hint font-ui-2xs">
          To connect SimpleReport to {totpType}, scan this QR code in the app.
        </p>
        <div className="display-flex flex-column flex-align-center">
          <img src={qrCode} alt="TOTP QR Code" className="height-card" />
        </div>
        <Button
          className="margin-top-3"
          label={"Continue"}
          type={"submit"}
          onClick={() => setSubmitted(true)}
        />
      </Card>
    </CardBackground>
  );
};
