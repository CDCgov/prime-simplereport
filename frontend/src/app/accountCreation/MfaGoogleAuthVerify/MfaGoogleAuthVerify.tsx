import { MfaVerify } from "../MfaVerify/MfaVerify";

export const MfaGoogleAuthVerify = () => (
  <MfaVerify
    hint={<>Enter a code from the Google Authenticator app.</>}
    hideResend={true}
  />
);
