import { MfaVerify } from "../../accountCreation/MfaVerify/MfaVerify";

interface Props {
  phoneNumber: string;
}

export const SecurityCode = (props: Props) => (
  <MfaVerify
    hint={
      <>
        We’ve sent a text message (SMS) to <b>{props.phoneNumber}</b>. It will
        expire in 10 minutes.
      </>
    }
  />
);
