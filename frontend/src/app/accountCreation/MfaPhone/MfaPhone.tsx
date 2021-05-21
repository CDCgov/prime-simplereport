import { AccountCreationApi } from "../AccountCreationApiService";
import { MfaSendCodeToContact } from "../MfaSendCodeToContact/MfaSendCodeToContact";

export const MfaPhone = () => {
  return (
    <MfaSendCodeToContact
      type="phone number"
      cardText="Get your security code via a phone call"
      serviceEnroll={AccountCreationApi.enrollVoiceCallMfa}
    />
  );
};
