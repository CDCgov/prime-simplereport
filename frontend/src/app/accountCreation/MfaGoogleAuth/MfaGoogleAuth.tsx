import { MfaTotp } from "../MfaTotp/MfaTotp";

interface Props {
  location: {
    state: {
      qrCode: any;
    };
  };
}
export const MfaGoogleAuth = (props: Props) => {
  return (
    <MfaTotp
      totpType="Google Authenticator"
      qrCode={props.location.state.qrCode}
    />
  );
};
