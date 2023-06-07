import { MfaVerify } from "../MfaVerify/MfaVerify";
import { useDocumentTitle } from "../../utils/hooks";

export const MfaGoogleAuthVerify = () => {
  useDocumentTitle("Verify your security code");

  return (
    <MfaVerify
      hint={<>Enter a code from the Google Authenticator app.</>}
      hideResend={true}
    />
  );
};
