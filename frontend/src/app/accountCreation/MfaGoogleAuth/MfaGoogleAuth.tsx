import { AccountCreationApi } from "../AccountCreationApiService";
import { MfaTotp } from "../MfaTotp/MfaTotp";
import { useDocumentTitle } from "../../utils/hooks";

export const MfaGoogleAuth = () => {
  useDocumentTitle(
    "Set up authentication via the Google Authenticator application"
  );

  return (
    <MfaTotp
      totpType="Google Authenticator"
      enrollFunction={() => AccountCreationApi.enrollTotpMfa("Google")}
    />
  );
};
