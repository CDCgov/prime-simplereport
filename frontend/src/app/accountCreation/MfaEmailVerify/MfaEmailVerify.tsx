import { MfaVerify } from "../MfaVerify/MfaVerify";

interface Props {
  location: { state: { contact: string } };
}

export const MfaEmailVerify = (props: Props) => (
  <MfaVerify
    hint={
      <>
        We’ve sent an email to <b>{props.location.state.contact}</b>. It will
        expire in 5 minutes.
      </>
    }
  />
);
