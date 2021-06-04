const API_URL = process.env.REACT_APP_BACKEND_URL + "/user-account";
const headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

const getOptions = (
  body: any
): {
  method: string;
  headers: HeadersInit;
  body: string | undefined;
} => {
  return {
    method: "POST",
    headers,
    body: body ? JSON.stringify(body) : undefined,
  };
};

const request = async (path: string, body: any) => {
  const res = await fetch(API_URL + path, getOptions(body));
  if (!res.ok) {
    throw res;
  }
  try {
    return await res.json();
  } catch {
    return "success";
  }
};

export class AccountCreationApi {
  static setPassword(activationToken: string, password: string): Promise<any> {
    return request("/initialize-and-set-password", {
      activationToken,
      password,
    });
  }

  static setRecoveryQuestion(question: string, answer: string) {
    return request("/set-recovery-question", {
      question,
      answer,
    });
  }

  static enrollSmsMfa(phone: string) {
    return request("/enroll-sms-mfa", { userInput: phone });
  }

  static enrollVoiceCallMfa(phone: string) {
    return request("/enroll-voice-call-mfa", { userInput: phone });
  }

  static enrollEmailMfa(email: string) {
    return request("/enroll-email-mfa", { userInput: email });
  }

  static enrollTotpMfa(app: string) {
    return request("/authenticator-qr", { userInput: app });
  }

  static enrollSecurityKeyMfa() {
    return request("/enroll-security-key-mfa", null);
  }

  static activateSecurityKeyMfa(attestation: string, clientData: string) {
    return request("/activate-security-key-mfa", { attestation, clientData });
  }

  static verifyActivationPasscode(code: string) {
    return request("/verify-activation-passcode", { code });
  }

  static resendActivationPasscode() {
    return request("/resend-activation-passcode", null);
  }
}
