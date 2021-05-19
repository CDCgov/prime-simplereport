import { MfaVerify } from "../MfaVerify/MfaVerify";

interface Props {
  email: string;
}

export const MfaEmailVerify = (props: Props) => (
  <MfaVerify
    hint={
      <>
        We’ve sent an email to <b>{props.email}</b>. It will expire in 10
        minutes.
      </>
    }
  />
);
