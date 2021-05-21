const API_URL = process.env.REACT_APP_BACKEND_URL + "/user-account";
const headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

const getOptions = (
  body: any
): {
  method: string;
  mode: RequestMode;
  headers: HeadersInit;
  body: string;
} => {
  return {
    method: "POST",
    mode: "cors",
    headers,
    body: JSON.stringify(body),
  };
};

const request = (path: string, body: any): Promise<any> => {
  return fetch(API_URL + path, getOptions(body)).then((res) => {
    if (!res.ok) {
      throw res;
    }
    return "success";
  });
};

export class AccountCreationApi {
  static setPassword(activationToken: string, password: string): Promise<any> {
    return request("/initialize-and-set-password", {
      activationToken,
      password,
    });
  }

  static setRecoveryQuestion(recoveryQuestion: string, recoveryAnswer: string) {
    return request("/set-recovery-question", {
      recoveryQuestion,
      recoveryAnswer,
    });
  }

  static enrollSmsMfa(phone: string) {
    return request("/enroll-sms-mfa", { phone });
  }

  static enrollVoiceCallMfa(phone: string) {
    return request("/enroll-voice-call-mfa", { phone });
  }

  static enrollEmailMfa(email: string) {
    return request("/enroll-email-mfa", { email });
  }

  static verifyActivationPasscode(code: string) {
    return request("/verify-activation-passcode", { code });
  }
}
