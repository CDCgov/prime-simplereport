const API_URL = process.env.REACT_APP_BACKEND_URL + "/pxp";
const headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

export class PxpApi {
  static validateDob(plid: string, dob: string): Promise<any> {
    return fetch(`${API_URL}/link/verify`, {
      method: "put",
      mode: "cors",
      headers,
      body: JSON.stringify({
        plid,
        dob,
      }),
    }).then((res) => {
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      return res.json();
    });
  }

  static submitQuestions(plid: string, dob: string, data: any) {
    return fetch(`${API_URL}/questions`, {
      method: "put",
      mode: "cors",
      headers,
      body: JSON.stringify({
        plid,
        dob,
        data,
      }),
    });
  }

  static updatePatient(plid: string, dob: string, data: any) {
    return fetch(`${API_URL}/patient`, {
      method: "put",
      mode: "cors",
      headers,
      body: JSON.stringify({
        plid,
        dob,
        data,
      }),
    }).then((res) => res.json());
  }
}
