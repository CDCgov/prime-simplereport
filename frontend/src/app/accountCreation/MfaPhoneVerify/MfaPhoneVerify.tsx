import { useLocation } from "react-router-dom";

import { MfaVerify } from "../MfaVerify/MfaVerify";
import { formatPhoneNumber } from "../../utils/text";

export const MfaPhoneVerify = () => {
  const location: any = useLocation();

  return (
    <MfaVerify
      hint={
        <>
          You should receive a phone call with a security code at{" "}
          <b>{formatPhoneNumber(location.state.contact)}</b>. It will expire in
          5 minutes.
        </>
      }
    />
  );
};
