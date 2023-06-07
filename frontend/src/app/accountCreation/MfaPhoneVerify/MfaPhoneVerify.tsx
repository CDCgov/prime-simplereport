import { useLocation } from "react-router-dom";

import { MfaVerify } from "../MfaVerify/MfaVerify";
import { formatPhoneNumber } from "../../utils/text";
import { useDocumentTitle } from "../../utils/hooks";

export const MfaPhoneVerify = () => {
  useDocumentTitle("Verify your security code");
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
