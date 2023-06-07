import { useLocation } from "react-router-dom";

import { MfaVerify } from "../MfaVerify/MfaVerify";
import { formatPhoneNumber } from "../../utils/text";
import { useDocumentTitle } from "../../utils/hooks";

export const MfaSmsVerify = () => {
  useDocumentTitle("Verify your security code");
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
