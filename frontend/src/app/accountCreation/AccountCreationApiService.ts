import FetchClient from "../utils/api";

import { UserAccountStatus } from "./UserAccountStatus";

const api = new FetchClient("/user-account");

export class AccountCreationApi {
  static getUserStatus(
    activationToken: string | null = null
  ): Promise<UserAccountStatus> {
    const query = activationToken ? `?activationToken=${activationToken}` : "";
    return api.request("/user-status", null, "GET", query);
  }

  static initialize(activationToken: string) {
    return api.request("/initialize", {
      activationToken,
    });
  }

  static setPassword(password: string) {
    return api.request("/set-password", {
      password,
    });
  }

  static setRecoveryQuestion(question: string, answer: string) {
    return api.request("/set-recovery-question", {
      question,
      answer,
    });
  }

  static enrollSmsMfa(phone: string) {
    return api.request("/enroll-sms-mfa", { userInput: phone });
  }

  static enrollVoiceCallMfa(phone: string) {
    return api.request("/enroll-voice-call-mfa", { userInput: phone });
  }

  static enrollEmailMfa() {
    return api.request("/enroll-email-mfa", null);
  }

  static enrollTotpMfa(app: "Google" | "Okta") {
    return api.request("/authenticator-qr", { userInput: app });
  }

  static enrollSecurityKeyMfa() {
    return api.request("/enroll-security-key-mfa", null);
  }

  static activateSecurityKeyMfa(attestation: string, clientData: string) {
    return api.request("/activate-security-key-mfa", {
      attestation,
      clientData,
    });
  }

  static verifyActivationPasscode(code: string) {
    return api.request("/verify-activation-passcode", {
      userInput: code,
    });
  }

  static resendActivationPasscode() {
    return api.request("/resend-activation-passcode", null);
  }
}
