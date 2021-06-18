import { AccountCreationApi } from "../AccountCreationApiService";
import { MfaTotp } from "../MfaTotp/MfaTotp";

export const MfaOkta = () => {
  return (
    <MfaTotp
      totpType="Okta Verify"
      enrollFunction={() => AccountCreationApi.enrollTotpMfa("Okta")}
    />
  );
};
