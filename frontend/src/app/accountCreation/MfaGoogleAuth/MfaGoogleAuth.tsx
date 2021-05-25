import { MfaTotp } from "../MfaTotp/MfaTotp";

interface Props {
  qrCode: string;
}

export const MfaGoogleAuth = (props: Props) => {
  return <MfaTotp totpType="Google Authenticator" qrCode={props.qrCode} />;
};
