package gov.cdc.usds.simplereport.api.model.useraccountcreation;

public enum UserAccountStatus {
  ACTIVE,
  PENDING_ACTIVATION,
  PASSWORD_RESET,
  SET_SECURITY_QUESTIONS,
  MFA_SELECT,
  MFA_PENDING_ACTIVATION,
  UNKNOWN
}
