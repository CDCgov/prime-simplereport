import { MfaTotp } from "../MfaTotp/MfaTotp";

interface Props {
  qrCode: string;
}

export const MfaOktaVerify = (props: Props) => {
  return <MfaTotp totpType="Okta Verify" qrCode={props.qrCode} />;
};
