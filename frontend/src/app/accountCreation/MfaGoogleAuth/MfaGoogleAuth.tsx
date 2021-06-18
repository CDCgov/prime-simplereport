import { AccountCreationApi } from "../AccountCreationApiService";
import { MfaTotp } from "../MfaTotp/MfaTotp";

export const MfaGoogleAuth = () => {
  return (
    <MfaTotp
      totpType="Google Authenticator"
      enrollFunction={() => AccountCreationApi.enrollTotpMfa("Google")}
    />
  );
};
