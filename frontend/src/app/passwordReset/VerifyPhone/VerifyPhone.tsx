import { MfaVerify } from "../MfaVerify/MfaVerify";

interface Props {
  phoneNumber: string;
}

export const VerifyPhone = (props: Props) => (
  <MfaVerify
    hint={
      <>
        We sent a security code to <b>{props.phoneNumber}</b>. This code will
        expire in 10 minutes.
      </>
    }
    type="phone call"
  />
);
