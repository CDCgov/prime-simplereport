import { useLocation } from "react-router-dom";

import { MfaVerify } from "../MfaVerify/MfaVerify";
import { formatPhoneNumber } from "../../utils/text";

export const MfaSmsVerify = () => {
  const location: any = useLocation();

  return (
    <MfaVerify
      hint={
        <>
          We’ve sent a text message (SMS) to{" "}
          <b>{formatPhoneNumber(location.state.contact)}</b>. It will expire in
          5 minutes.
        </>
      }
    />
  );
};
