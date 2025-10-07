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
  registrationLink: string | undefined;
  address: Omit<UpdatePatientData["address"], "zipCode"> & {
    postalCode: string | null;
  };
};

export interface VerifyV2Response {
  testEventId: string;
  result: TestResult;
  results: MultiplexResult[];
  dateTested: string;
  correctionStatus: string;
  deviceType: {
    name: string;
    model: string;
  };
  organization: {
    name: string;
  };
  facility: {
    name: string;
    cliaNumber: string;
    street: string;
    streetTwo: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    orderingProvider: {
      firstName: string;
      lastName: string;
      middleName: string;
      npi: string;
    };
  };
  patient: {
    firstName: string;
    lastName: string;
    middleName: string;
    birthDate: string;
  };
}

export interface TestResultUnauthenticated {
  patient: {
    firstName: string;
    lastName: string;
  };
  facility: {
    name: string;
    phone: string;
  };
  expiresAt: Date;
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class PxpApi {
  static async validateDateOfBirth(
    patientLinkId: string,
    dateOfBirth: string
  ): Promise<VerifyV2Response> {
    return await api.request("/link/verify/v2", {
      patientLinkId,
      dateOfBirth,
    });
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  static async submitQuestions(
    patientLinkId: string,
    dateOfBirth: string,
    data: any
  ) {
    return await api.request("/questions", {
      patientLinkId,
      dateOfBirth,
      data,
    });
  }

  static getEntityName = async (
    registrationLink: string | undefined
  ): Promise<string> => {
    return await api.getRequest(
      `/register/entity-name?patientRegistrationLink=${registrationLink}`
    );
  };

  static getTestResultUnauthenticated = async (
    patientLink: string
  ): Promise<TestResultUnauthenticated> => {
    return await api.request(`/entity?patientLink=${patientLink}`, null, "GET");
  };

  static selfRegister = async (person: SelfRegistrationData): Promise<void> => {
    return await api.request("/register", person);
  };

  static checkDuplicateRegistrant = async (person: {
    firstName: string;
    lastName: string;
    birthDate: ISODate;
    registrationLink: string | undefined;
  }): Promise<boolean> => {
    const { registrationLink, ...body } = person;

    return await api.request(
      "/register/existing-patient",
      body,
      "POST",
      `?patientRegistrationLink=${registrationLink}`
    );
  };
}
