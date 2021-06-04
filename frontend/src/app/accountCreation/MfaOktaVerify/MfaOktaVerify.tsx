import { AccountCreationApi } from "../AccountCreationApiService";
import { MfaTotp } from "../MfaTotp/MfaTotp";

export const MfaOktaVerify = () => {
  return (
    <MfaTotp
      totpType="Okta Verify"
      enrollFunction={() => AccountCreationApi.enrollTotpMfa("Okta")}
    />
  );
};
