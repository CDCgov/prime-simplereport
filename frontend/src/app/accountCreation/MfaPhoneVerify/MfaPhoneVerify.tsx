import { MfaVerify } from "../MfaVerify/MfaVerify";
import { formatPhoneNumber } from "../../utils/text";

interface Props {
  location: { state: { contact: string } };
}

export const MfaPhoneVerify = (props: Props) => (
  <MfaVerify
    hint={
      <>
        You should receive a phone call with a security code at{" "}
        <b>{formatPhoneNumber(props.location.state.contact)}</b>. It will expire in 5 minutes.
      </>
    }
  />
);
