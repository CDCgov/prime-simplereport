import { AccountCreationApi } from "../AccountCreationApiService";
import { MfaSendCodeToContact } from "../MfaSendCodeToContact/MfaSendCodeToContact";
import { useDocumentTitle } from "../../utils/hooks";

export const MfaSms = () => {
  useDocumentTitle("Set up authentication via text message (SMS)");

  return (
    <MfaSendCodeToContact
      type="phone number"
      cardText="Get your security code via text message (SMS)."
      cardHint="Message and data rates may apply."
      serviceEnroll={AccountCreationApi.enrollSmsMfa}
    />
  );
};
