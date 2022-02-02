import FetchClient from "../app/utils/api";

const api = new FetchClient("/pxp", { mode: "cors" });

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

export type SelfRegistrationData = Omit<
  UpdatePatientData,
  "facilityId" | "address"
> & {
  birthDate: ISODate;
  registrationLink: string;
  address: Omit<UpdatePatientData["address"], "zipCode"> & {
    postalCode: string | null;
  };
};

export class PxpApi {
  static validateDateOfBirth(
    patientLinkId: string,
    dateOfBirth: string
  ): Promise<any> {
    return api.request("/link/verify", {
      patientLinkId,
      dateOfBirth,
    });
  }

  static submitQuestions(
    patientLinkId: string,
    dateOfBirth: string,
    data: any
  ) {
    return api.request("/questions", {
      patientLinkId,
      dateOfBirth,
      data,
    });
  }

  static updatePatient(
    patientLinkId: string,
    dateOfBirth: string,
    data: UpdatePatientData
  ) {
    return api.request("/patient", {
      patientLinkId,
      dateOfBirth,
      data,
    });
  }

  static getEntityName = async (registrationLink: string): Promise<string> => {
    return api.getRequest(
      `/register/entity-name?patientRegistrationLink=${registrationLink}`
    );
  };

  static selfRegister = async (person: SelfRegistrationData): Promise<void> => {
    return api.request("/register", person);
  };

  static checkDuplicateRegistrant = async (person: {
    firstName: string;
    lastName: string;
    birthDate: ISODate;
    registrationLink: string;
  }): Promise<boolean> => {
    const { registrationLink, ...body } = person;

    return api.request(
      "/register/existing-patient",
      body,
      "POST",
      `?patientRegistrationLink=${registrationLink}`
    );
  };
}
