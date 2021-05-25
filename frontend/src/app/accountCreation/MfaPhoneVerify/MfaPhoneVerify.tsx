import { MfaVerify } from "../MfaVerify/MfaVerify";

interface Props {
  location: { state: { phoneNumber: string } };
}

export const MfaPhoneVerify = (props: Props) => (
  <MfaVerify
    hint={
      <>
        You should receive a phone call with a security code at{" "}
        <b>{props.location?.state?.phoneNumber || ""}</b>. It will expire in 10
        minutes.
      </>
    }
  />
);
