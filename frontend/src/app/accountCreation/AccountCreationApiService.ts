const API_URL = process.env.REACT_APP_BACKEND_URL + "/user-account";
const headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

export class AccountCreationApi {
  static setPassword(activationToken: string, password: string): Promise<any> {
    return fetch(`${API_URL}/initialize-and-set-password`, {
      method: "POST",
      mode: "cors",
      headers,
      body: JSON.stringify({
        activationToken,
        password,
      }),
    }).then((res) => {
      if (!res.ok) {
        throw res;
      }
      return res.json();
    });
  }

  static setRecoveryQuestion(data: any) {
    return fetch(`${API_URL}/set-recovery-question`, {
      method: "POST",
      mode: "cors",
      headers,
      body: JSON.stringify({
        data,
      }),
    });
  }
}
