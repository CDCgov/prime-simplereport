import { MfaVerify } from "../MfaVerify/MfaVerify";

export const SecurityCode = () => (
  <MfaVerify
    hint={
      <>
        Enter a one-time security code from your authenticator application
        (Google Authenticator or Okta)
      </>
    }
    type="authentication app"
  />
);
