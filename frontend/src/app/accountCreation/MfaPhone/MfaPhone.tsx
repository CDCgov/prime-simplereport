import { AccountCreationApi } from "../AccountCreationApiService";
import { MfaSendCodeToContact } from "../MfaSendCodeToContact/MfaSendCodeToContact";
import { useDocumentTitle } from "../../utils/hooks";

export const MfaPhone = () => {
  useDocumentTitle("Set up authentication via a phone call");

  return (
    <MfaSendCodeToContact
      type="phone number"
      cardText="Get your security code via a phone call"
      serviceEnroll={AccountCreationApi.enrollVoiceCallMfa}
    />
  );
};
