import { useEffect, useState } from "react";
import { Redirect } from "react-router";

import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import StepIndicator from "../../commonComponents/StepIndicator";
import { accountCreationSteps } from "../../../config/constants";
import iconLoader from "../../../../node_modules/uswds/dist/img/loader.svg";
import { AccountCreationApi } from "../AccountCreationApiService";
import { strToBin, binToStr } from "../../utils/text";

export const MfaSecurityKey = () => {
  const [attestation, setAttestation] = useState("");
  const [clientData, setClientData] = useState("");
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    const enrollKey = async () => {
      const { activation } = await AccountCreationApi.enrollSecurityKeyMfa();
      if (!activation.challenge) return;
      const publicKey = Object.assign({}, activation);
      // Convert activation object's challenge and user id from string to binary
      publicKey.challenge = strToBin(activation.challenge);
      publicKey.user.id = strToBin(activation.user.id);

      // navigator.credentials is a global object on WebAuthn-supported clients, used to access WebAuthn API
      navigator.credentials
        .create({ publicKey })
        .then(function (newCredential) {
          // Get attestation and clientData from callback result, convert from binary to string
          const response = (newCredential as PublicKeyCredential)
            ?.response as AuthenticatorAttestationResponse;
          setAttestation(binToStr(response.attestationObject));
          setClientData(binToStr(response.clientDataJSON));
        });
    };
    enrollKey();
  }, []);

  useEffect(() => {
    if (attestation && clientData) {
      try {
        AccountCreationApi.activateSecurityKeyMfa(attestation, clientData);
        setActivated(true);
      } catch (error) {
        console.error("Error trying to activate security key: ", error);
      }
    }
  }, [attestation, clientData]);

  if (activated) {
    return <Redirect to="/success" />;
  }

  return (
    <CardBackground>
      <Card logo bodyKicker="Set up your account">
        <StepIndicator
          steps={accountCreationSteps}
          currentStepValue={"2"}
          noLabels={true}
        />
        <p className="margin-bottom-0">Register your security key.</p>
        <ol className="usa-list usa-hint font-ui-2xs">
          <li>
            Insert your Security Key in your computer’s USB port or connect it
            with a USB cable.
          </li>
          <li>
            Once connected, tap the button or gold disk if your key has one.
          </li>
        </ol>
        <div className="display-flex flex-column flex-align-center">
          <img className="square-5 chromatic-ignore" src={iconLoader} alt="" />
        </div>
        {/* <Button className="margin-top-3" label={"Continue"} type={"submit"} /> */}
      </Card>
      <p className="margin-top-4">
        <a href="#0">Return to previous step</a>
      </p>
    </CardBackground>
  );
};
