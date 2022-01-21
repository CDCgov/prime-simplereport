import { routeFromStatus, UserAccountStatus } from "./UserAccountStatus";

describe("UserAccountStatus", () => {
  it("returns initial page for user pending activation", () => {
    expect(routeFromStatus(UserAccountStatus.PENDING_ACTIVATION)).toBe("/");
  });
  it("returns set-password page for password reset", () => {
    expect(routeFromStatus(UserAccountStatus.PASSWORD_RESET)).toBe(
      "set-password"
    );
  });
  it("returns set-recovery-questions page for set security questions", () => {
    expect(routeFromStatus(UserAccountStatus.SET_SECURITY_QUESTIONS)).toBe(
      "set-recovery-question"
    );
  });
  it("returns mfa-select page for user pending mfa selection", () => {
    expect(routeFromStatus(UserAccountStatus.MFA_SELECT)).toBe("mfa-select");
  });
  it("returns sms-verify page for user pending sms verification", () => {
    expect(routeFromStatus(UserAccountStatus.SMS_PENDING_ACTIVATION)).toBe(
      "mfa-sms/verify"
    );
  });
  it("returns phone-verify page for user pending call verification", () => {
    expect(routeFromStatus(UserAccountStatus.CALL_PENDING_ACTIVATION)).toBe(
      "mfa-phone/verify"
    );
  });
  it("returns email-verify page for user pending email verification", () => {
    expect(routeFromStatus(UserAccountStatus.EMAIL_PENDING_ACTIVATION)).toBe(
      "mfa-email/verify"
    );
  });
  it("returns google-auth-verify page for user pending google verification", () => {
    expect(routeFromStatus(UserAccountStatus.GOOGLE_PENDING_ACTIVATION)).toBe(
      "mfa-google-auth/verify"
    );
  });
  it("returns okta-auth page for user pending okta verification", () => {
    expect(routeFromStatus(UserAccountStatus.OKTA_PENDING_ACTIVATION)).toBe(
      "mfa-okta/verify"
    );
  });
  it("returns security-key page for user pending fido verification", () => {
    expect(routeFromStatus(UserAccountStatus.FIDO_PENDING_ACTIVATION)).toBe(
      "mfa-security-key"
    );
  });
  it("returns success page for an active user", () => {
    expect(routeFromStatus(UserAccountStatus.ACTIVE)).toBe("success");
  });
  it("returns not-found page for an unknown state", () => {
    expect(routeFromStatus(UserAccountStatus.UNKNOWN)).toBe("not-found");
  });
});
