package gov.cdc.usds.simplereport.api;

/** Container class for test constants related to REST handler testing */
public final class ResourceLinks {
  public static final String DEVICES = "/devices";
  public static final String VERIFY_LINK_V2 = "/pxp/link/verify/v2";

  public static final String SELF_REGISTER = "/pxp/register";
  public static final String EXISTING_PATIENT = "/pxp/register/existing-patient";
  public static final String GET_TEST_RESULT_UNAUTHENTICATED = "/pxp/entity";
  public static final String ENTITY_NAME = "/pxp/register/entity-name";

  public static final String WAITLIST_REQUEST = "/account-request/waitlist";
  public static final String ACCOUNT_REQUEST_ORGANIZATION_ADD_TO_QUEUE =
      "/account-request/organization-add-to-queue";
  public static final String USER_GET_STATUS = "/user-account/user-status";
  public static final String USER_ACTIVATE_ACCOUNT_REQUEST = "/user-account/initialize";
  public static final String USER_SET_PASSWORD = "/user-account/set-password";
  public static final String USER_SET_RECOVERY_QUESTION = "/user-account/set-recovery-question";
  public static final String USER_ENROLL_SMS_MFA = "/user-account/enroll-sms-mfa";
  public static final String USER_ENROLL_VOICE_CALL_MFA = "/user-account/enroll-voice-call-mfa";
  public static final String USER_ENROLL_EMAIL_MFA = "/user-account/enroll-email-mfa";
  public static final String USER_ENROLL_AUTH_APP_MFA = "/user-account/authenticator-qr";
  public static final String USER_ENROLL_SECURITY_KEY_MFA = "/user-account/enroll-security-key-mfa";
  public static final String USER_ACTIVATE_SECURITY_KEY_MFA =
      "/user-account/activate-security-key-mfa";
  public static final String USER_VERIFY_ACTIVATION_PASSCODE =
      "/user-account/verify-activation-passcode";
  public static final String USER_RESEND_ACTIVATION_PASSCODE =
      "/user-account/resend-activation-passcode";
  public static final String ID_VERIFICATION_GET_QUESTIONS = "/identity-verification/get-questions";
  public static final String ID_VERIFICATION_SUBMIT_ANSWERS =
      "/identity-verification/submit-answers";

  public static final String TWILIO_CALLBACK = "/pxp/callback";
}
