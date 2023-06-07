import { AccountCreationApi } from "../AccountCreationApiService";
import { MfaTotp } from "../MfaTotp/MfaTotp";
import { useDocumentTitle } from "../../utils/hooks";

export const MfaOkta = () => {
  useDocumentTitle("Set up authentication via the okta verify application");

  return (
    <MfaTotp
      totpType="Okta Verify"
      enrollFunction={() => AccountCreationApi.enrollTotpMfa("Okta")}
    />
  );
};
