const API_URL = process.env.REACT_APP_PXP_BACKEND_URL;
const headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

export class PxpApi {
  static getOrgFromPlid(plid: string): Promise<any> {
    return fetch(`${API_URL}/link/${plid}`, { mode: "cors" }).then((res) =>
      res.json()
    );
  }

  static validateDob(plid: string, dob: string): Promise<any> {
    return fetch(`${API_URL}/link/verify`, {
      method: "put",
      mode: "cors",
      headers,
      body: JSON.stringify({
        plid,
        dob,
      }),
    }).then((res) => res.json());
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
