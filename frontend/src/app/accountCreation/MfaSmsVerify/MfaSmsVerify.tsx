import { MfaVerify } from "../MfaVerify/MfaVerify";
import { formatPhoneNumber } from "../../utils/text";

interface Props {
  location: { state: { contact: string } };
}

export const MfaSmsVerify = (props: Props) => (
  <MfaVerify
    hint={
      <>
        We’ve sent a text message (SMS) to{" "}
        <b>{formatPhoneNumber(props.location.state.contact)}</b>. It will expire
        in 5 minutes.
      </>
    }
  />
);
