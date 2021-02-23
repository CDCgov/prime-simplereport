const API_URL = process.env.REACT_APP_BACKEND_URL + "/pxp";
const headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

export class PxpApi {
  static validateDateOfBirth(
    patientLinkId: string,
    dateOfBirth: string
  ): Promise<any> {
    return fetch(`${API_URL}/link/verify`, {
      method: "put",
      mode: "cors",
      headers,
      body: JSON.stringify({
        patientLinkId,
        dateOfBirth,
      }),
    }).then((res) => {
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      return res.json();
    });
  }

  static submitQuestions(
    patientLinkId: string,
    dateOfBirth: string,
    data: any
  ) {
    return fetch(`${API_URL}/questions`, {
      method: "put",
      mode: "cors",
      headers,
      body: JSON.stringify({
        patientLinkId,
        dateOfBirth,
        data,
      }),
    });
  }

  static updatePatient(patientLinkId: string, dateOfBirth: string, data: any) {
    return fetch(`${API_URL}/patient`, {
      method: "put",
      mode: "cors",
      headers,
      body: JSON.stringify({
        patientLinkId,
        dateOfBirth,
        data,
      }),
    }).then((res) => res.json());
  }
}
