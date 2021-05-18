import { MfaVerify } from "../../accountCreation/MfaVerify/MfaVerify";

export const Authenticator = () => (
  <MfaVerify
    hint={
      <>
        Enter a one-time security code from your authenticator application
        (Google Authenticator, Authy, etc.)
      </>
    }
  />
);
