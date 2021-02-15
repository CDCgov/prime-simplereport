const API_URL = process.env.REACT_APP_PXP_BACKEND_URL;

export class PxpApi {
  static getOrgFromPlid(plid: String): Promise<any> {
    return fetch(`${API_URL}/link/${plid}`, { mode: "cors" }).then((res) =>
      res.json()
    );
  }

  static validateDob(plid: String, dob: String): Promise<any> {
    return fetch(`${API_URL}/link/verify`, {
      method: "put",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plid,
        dob,
      }),
    }).then((res) => res.json());
  }
}
