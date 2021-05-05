const API_URL = process.env.REACT_APP_BACKEND_URL + "/pxp";
const headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

// due to @JsonIgnores on Person to avoid duplicate recording, we have to
// inline the address so that it can be deserialized outside the context
// of GraphQL, which understands the flattened shape in its schema
interface UpdatePatientData
  extends Nullable<
    Omit<
      PersonFormData,
      | "lookupId"
      | "street"
      | "streetTwo"
      | "city"
      | "state"
      | "county"
      | "zipCode"
      | "firstName"
      | "middleName"
      | "lastName"
      | "birthDate"
    >
  > {
  address: {
    street: [string | null, string | null];
    city: string | null;
    state: string | null;
    county: string | null;
    zipCode: string | null;
  };
}

export class PxpApi {
  static validateDateOfBirth(
    patientLinkId: string,
    dateOfBirth: string
  ): Promise<any> {
    return fetch(`${API_URL}/link/verify`, {
      method: "POST",
      mode: "cors",
      headers,
      body: JSON.stringify({
        patientLinkId,
        dateOfBirth,
      }),
    }).then((res) => {
      if (!res.ok) {
        throw res;
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
      method: "POST",
      mode: "cors",
      headers,
      body: JSON.stringify({
        patientLinkId,
        dateOfBirth,
        data,
      }),
    });
  }

  static updatePatient(
    patientLinkId: string,
    dateOfBirth: string,
    data: UpdatePatientData
  ) {
    return fetch(`${API_URL}/patient`, {
      method: "POST",
      mode: "cors",
      headers,
      body: JSON.stringify({
        patientLinkId,
        dateOfBirth,
        data,
      }),
    }).then((res) => res.json());
  }

  static getEntityName = async (registrationLink: string): Promise<string> => {
    const res = await fetch(
      `${API_URL}/register/entity-name?patientRegistrationLink=${registrationLink}`
    );
    if (!res.ok) {
      throw res;
    }
    return await res.json();
  };
}
