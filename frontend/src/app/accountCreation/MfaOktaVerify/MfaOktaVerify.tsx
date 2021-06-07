import { MfaVerify } from "../MfaVerify/MfaVerify";

export const MfaOktaVerify = () => (
  <MfaVerify
    hint={<>Enter a code from the Okta Verify app.</>}
    hideResend={true}
  />
);
