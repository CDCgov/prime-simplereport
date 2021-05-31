import { MfaVerify } from "../MfaVerify/MfaVerify";

interface Props {
  phoneNumber: string;
}

export const VerifySms = (props: Props) => (
  <MfaVerify
    hint={
      <>
        We texted a security code to <b>{props.phoneNumber}</b>. This code will
        expire in 10 minutes.
      </>
    }
    type="text message (SMS)"
  />
);
