import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import Button from "../../commonComponents/Button/Button";
import StepIndicator from "../../commonComponents/StepIndicator";
import { accountCreationSteps } from "../../../config/constants";
import { LoadingCard } from "../../commonComponents/LoadingCard/LoadingCard";

interface Props {
  enrollFunction: () => Promise<{ qrcode: string }>;
  totpType: string;
  children?: React.ReactNode;
}

export const MfaTotp = ({ enrollFunction, totpType }: Props) => {
  /**
   * QR retrieval and component initialization
   */
  const initialize = useRef(true);
  const [qrCode, setQrCode] = useState("");

  useEffect(() => {
    const getQrCode = async () => {
      const { qrcode } = await enrollFunction();
      setQrCode(qrcode);
    };
    if (initialize.current) {
      getQrCode();
      initialize.current = false;
    }
  }, [enrollFunction]);

  /**
   * handle continue to verify
   */
  const navigate = useNavigate();
  const handleNavigate = () => {
    navigate("verify");
  };

  if (!qrCode) {
    return <LoadingCard message="Retrieving QR code" />;
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
          onClick={handleNavigate}
          id={"continue"}
        />
      </Card>
    </CardBackground>
  );
};
