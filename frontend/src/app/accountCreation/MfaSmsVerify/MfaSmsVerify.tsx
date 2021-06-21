import { MfaVerify } from "../MfaVerify/MfaVerify";

interface Props {
  location: { state: { contact: string } };
}

export const MfaSmsVerify = (props: Props) => (
  <MfaVerify
    hint={
      <>
        We’ve sent a text message (SMS) to <b>{props.location.state.contact}</b>
        . It will expire in 5 minutes.
      </>
    }
  />
);
