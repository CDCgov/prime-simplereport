import { useEffect } from "react";

import { AccountCreationApi } from "../AccountCreationApiService";
import { MfaVerify } from "../MfaVerify/MfaVerify";

export const MfaEmailVerify = () => {
  useEffect(() => {
    AccountCreationApi.enrollEmailMfa();
  }, []);

  return (
    <MfaVerify
      hint={
        <>
          We’ve sent you an email with a one-time security code. It will expire
          in 5 minutes.
        </>
      }
    />
  );
};
