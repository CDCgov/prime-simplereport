import { MfaTotp } from "../MfaTotp/MfaTotp";

interface Props {
  location: {
    state: {
      qrCode: any;
    };
  };
}

export const MfaOktaVerify = (props: Props) => {
  return (
    <MfaTotp totpType="Okta Verify" qrCode={props.location.state.qrCode} />
  );
};
