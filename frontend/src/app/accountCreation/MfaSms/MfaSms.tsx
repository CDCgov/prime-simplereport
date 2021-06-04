import { AccountCreationApi } from "../AccountCreationApiService";
import { MfaSendCodeToContact } from "../MfaSendCodeToContact/MfaSendCodeToContact";

export const MfaSms = () => {
  return (
    <MfaSendCodeToContact
      type="phone number"
      cardText="Get your security code via text message (SMS)."
      cardHint="Message and data rates may apply. Not compatible with web-based (VOIP) phone services like Google Voice."
      serviceEnroll={AccountCreationApi.enrollSmsMfa}
    />
  );
};
