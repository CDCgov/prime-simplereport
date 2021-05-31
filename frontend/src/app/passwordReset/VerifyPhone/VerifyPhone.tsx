import { MfaVerify } from "../MfaVerify/MfaVerify";

// interface Props {
//   phoneNumber: string;
// }

export const VerifyPhone = () => (
  <MfaVerify
    hint={
      <>
        If you have a phone number connected to your SimpleReport account, we’ve
        sent a one-time security code. It will expire in 10 minutes.
      </>
    }
    type="voice call"
  />
);
