import { MfaVerify } from "../MfaVerify/MfaVerify";
import { useDocumentTitle } from "../../utils/hooks";

export const MfaOktaVerify = () => {
  useDocumentTitle("Verify your security code");

  return (
    <MfaVerify
      hint={<>Enter a code from the Okta Verify app.</>}
      hideResend={true}
    />
  );
};
