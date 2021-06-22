// This needs to be kept in sync with UserAccountStatus on the backend.

export enum UserAccountStatus {
    ACTIVE,
    PENDING_ACTIVATION,
    PASSWORD_RESET,
    SET_SECURITY_QUESTIONS,
    MFA_SELECT,
    MFA_PENDING_ACTIVATION,
    UNKNOWN
}