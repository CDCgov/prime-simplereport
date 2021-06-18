const API_URL = process.env.REACT_APP_BACKEND_URL + "/user-account";
const JSON_CONTENT = "application/json";
const headers = {
  "Content-Type": JSON_CONTENT,
  Accept: JSON_CONTENT,
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
  console.log("response: " + res);
  if (!res.ok) {
    console.log("there's been an error!", res)
    console.log("text: " + res.text());
    throw res;
  }
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.indexOf(JSON_CONTENT) !== -1) {
    try {
      return await res.json();
    } catch {
      throw new Error("Invalid JSON response during account creation");
    }
  } else {
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

  static enrollEmailMfa() {
    return request("/enroll-email-mfa", null);
  }

  static enrollTotpMfa(app: "Google" | "Okta") {
    return request("/authenticator-qr", { userInput: app });
  }

  static enrollSecurityKeyMfa() {
    return request("/enroll-security-key-mfa", null);
  }

  static activateSecurityKeyMfa(attestation: string, clientData: string) {
    return request("/activate-security-key-mfa", { attestation, clientData });
  }

  static verifyActivationPasscode(code: string) {
    return request("/verify-activation-passcode", { userInput: code });
  }

  static resendActivationPasscode() {
    return request("/resend-activation-passcode", null);
  }
}
