import FetchClient from "../utils/api";

const api = new FetchClient("/user-account");

export class AccountCreationApi {
  static setPassword(activationToken: string, password: string): Promise<any> {
    return api.request("/initialize-and-set-password", {
      activationToken,
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
    return api.request("/verify-activation-passcode", { userInput: code });
  }

  static resendActivationPasscode() {
    return api.request("/resend-activation-passcode", null);
  }
}
