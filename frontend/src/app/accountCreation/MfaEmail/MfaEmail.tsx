import { AccountCreationApi } from "../AccountCreationApiService";
import { MfaSendCodeToContact } from "../MfaSendCodeToContact/MfaSendCodeToContact";

export const MfaEmail = () => {
  return (
    <MfaSendCodeToContact
      type="email"
      cardText="Get your security code via email"
      serviceEnroll={AccountCreationApi.enrollEmailMfa}
    />
  );
};
