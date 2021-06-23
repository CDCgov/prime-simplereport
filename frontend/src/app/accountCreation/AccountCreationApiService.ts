import { UserAccountStatus } from "./UserAccountStatus";

const API_URL = process.env.REACT_APP_BACKEND_URL + "/user-account";
const JSON_CONTENT = "application/json";
const headers = {
  "Content-Type": JSON_CONTENT,
  Accept: JSON_CONTENT,
};

type RequestMethod = "GET" | "POST";

const getOptions = (
  method: RequestMethod,
  body: any
): {
  method: RequestMethod;
  headers: HeadersInit;
  body: string | undefined;
} => {
  return {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  };
};

const request = async (method: RequestMethod, path: string, body: any) => {
  const res = await fetch(API_URL + path, getOptions(method, body));
  console.log("response: " + res);
  if (!res.ok) {
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
  static getUserStatus(
    activationToken: string | null = null
  ): Promise<UserAccountStatus> {
    return request("GET", "/user-status", { activationToken });
  }

  static setPassword(activationToken: string, password: string): Promise<any> {
    return request("POST", "/initialize-and-set-password", {
      activationToken,
      password,
    });
  }

  static setRecoveryQuestion(question: string, answer: string) {
    return request("POST", "/set-recovery-question", {
      question,
      answer,
    });
  }

  static enrollSmsMfa(phone: string) {
    return request("POST", "/enroll-sms-mfa", { userInput: phone });
  }

  static enrollVoiceCallMfa(phone: string) {
    return request("POST", "/enroll-voice-call-mfa", { userInput: phone });
  }

  static enrollEmailMfa() {
    return request("POST", "/enroll-email-mfa", null);
  }

  static enrollTotpMfa(app: "Google" | "Okta") {
    return request("POST", "/authenticator-qr", { userInput: app });
  }

  static enrollSecurityKeyMfa() {
    return request("POST", "/enroll-security-key-mfa", null);
  }

  static activateSecurityKeyMfa(attestation: string, clientData: string) {
    return request("POST", "/activate-security-key-mfa", {
      attestation,
      clientData,
    });
  }

  static verifyActivationPasscode(code: string) {
    return request("POST", "/verify-activation-passcode", { userInput: code });
  }

  static resendActivationPasscode() {
    return request("POST", "/resend-activation-passcode", null);
  }
}
