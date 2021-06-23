// This needs to be kept in sync with UserAccountStatus on the backend.

import { Redirect } from "react-router";

import PageNotFound from "../commonComponents/PageNotFound";

export enum UserAccountStatus {
  ACTIVE,
  PENDING_ACTIVATION,
  PASSWORD_RESET,
  SET_SECURITY_QUESTIONS,
  MFA_SELECT,
  SMS_PENDING_ACTIVATION,
  CALL_PENDING_ACTIVATION,
  EMAIL_PENDING_ACTIVATION,
  GOOGLE_PENDING_ACTIVATION,
  OKTA_PENDING_ACTIVATION,
  FIDO_PENDING_ACTIVATION,
  UNKNOWN,
  LOADING,
}

export const routeFromStatus = (userAccountStatus: UserAccountStatus) => {
  switch (userAccountStatus) {
    case UserAccountStatus.PENDING_ACTIVATION:
      return <Redirect to="/" />;
    case UserAccountStatus.PASSWORD_RESET:
      return <Redirect to="/" />;
    case UserAccountStatus.SET_SECURITY_QUESTIONS:
      return <Redirect to="/set-recovery-question" />;
    case UserAccountStatus.MFA_SELECT:
      return <Redirect to="/mfa-select" />;
    case UserAccountStatus.SMS_PENDING_ACTIVATION:
      return <Redirect to="/mfa-sms/verify" />;
    case UserAccountStatus.CALL_PENDING_ACTIVATION:
      return <Redirect to="/mfa-phone/verify" />;
    case UserAccountStatus.EMAIL_PENDING_ACTIVATION:
      return <Redirect to="/mfa-email/verify" />;
    case UserAccountStatus.GOOGLE_PENDING_ACTIVATION:
      return <Redirect to="/mfa-google-auth/verify" />;
    case UserAccountStatus.OKTA_PENDING_ACTIVATION:
      return <Redirect to="/mfa-okta/verify" />;
    case UserAccountStatus.FIDO_PENDING_ACTIVATION:
      return <Redirect to="/mfa-security-key" />;
    case UserAccountStatus.ACTIVE:
      return <Redirect to="/success" />;
    default:
      return <PageNotFound />;
  }
};
