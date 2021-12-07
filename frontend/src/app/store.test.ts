import reducers, {
  initialState,
  setInitialState,
  SET_INITIAL_STATE,
  updateOrganization,
  UPDATE_ORGANIZATION,
  updateFacility,
  UPDATE_FACILITY,
  setPatient,
  SET_PATIENT,
} from "./store";

describe("store", () => {
  let testState: any;
  let setInitialStateState: any;
  let updateOrganizationState: any;
  let updateFacilityState: any;
  let setPatientState: any;
  const blankOrganization = {
    name: "",
  };
  const blankPatient = {
    birthDate: "",
    firstName: "",
    internalId: "",
    isDeleted: false,
    lastName: "",
    lastTest: {
      dateAdded: "",
      dateTested: "",
      deviceTypeModel: "",
      result: "UNDETERMINED",
    },
    middleName: "",
    role: "",
  };
  const blankUser = {
    email: "",
    firstName: "",
    id: "",
    isAdmin: false,
    lastName: "",
    middleName: "",
    permissions: [],
    roleDescription: "",
    suffix: "",
  };
  const reduxState = {
    dataLoaded: false,
    facilities: [],
    organization: blankOrganization,
    patient: blankPatient,
    user: blankUser,
  };
  setInitialStateState = {
    type: SET_INITIAL_STATE,
    payload: reduxState,
  };
  updateOrganizationState = {
    type: UPDATE_ORGANIZATION,
    payload: reduxState,
  };
  updateFacilityState = {
    type: UPDATE_FACILITY,
    payload: reduxState,
  };
  setPatientState = {
    type: SET_PATIENT,
    payload: reduxState,
  };

  beforeEach(() => {
    testState = reduxState;
    testState["organization"] = blankOrganization;
    testState["patient"] = blankPatient;
  });

  it("should return initial state with type SET_INITIAL_STATE type and initialState payload", () => {
    expect(setInitialState(initialState)).toEqual(setInitialStateState);
  });
  it("should return initial state with UPDATE_ORGANIZATION type and organization payload", () => {
    expect(updateOrganization(initialState)).toEqual(updateOrganizationState);
  });
  it("should return initial state with UPDATE_FACILITY type and facility payload", () => {
    expect(updateFacility(initialState)).toEqual(updateFacilityState);
  });
  it("should return initial state with SET_PATIENT type and patient payload", () => {
    expect(setPatient(initialState)).toEqual(setPatientState);
  });
  it("should return initial state if type does not match", () => {
    const brokenState = { brokenKey: "useless value" };
    const action = { type: "A_TYPE_THAT_WE_DO_NOT_USE", payload: brokenState };
    expect(reducers(undefined, action)).toEqual(testState);
  });
  it("should return the initial state", () => {
    const action = { type: SET_INITIAL_STATE, payload: initialState };
    expect(reducers(undefined, action)).toEqual(testState);
  });
  it("should update an organization", () => {
    const organizationPayload = { name: "myNewName" };
    const action = { type: UPDATE_ORGANIZATION, payload: organizationPayload };
    testState["organization"] = organizationPayload;
    expect(reducers(undefined, action)).toEqual(testState);
  });
  it("should add a facility", () => {
    const facilityPayload = { id: "8675309", name: "myFacilityName" };
    const payload = facilityPayload as Facility;
    const action = { type: UPDATE_FACILITY, payload: payload };
    testState["facilities"] = [payload];
    expect(reducers(undefined, action)).toEqual(testState);
  });
  it("should update a facility", () => {
    const facilityPayload = { id: "8675309", name: "myUpdatedFacilityName" };
    const payload = facilityPayload as Facility;
    const action = { type: UPDATE_FACILITY, payload: payload };
    testState["facilities"] = [payload];
    expect(reducers(undefined, action)).toEqual(testState);
  });
  it("should update a patient", () => {
    const patientPayload = {
      birthDate: "1999-01-01",
      firstName: "Jill",
      internalId: "42",
      isDeleted: true,
      lastName: "Mad Titan",
      lastTest: {
        dateAdded: "2001-01-01",
        dateTested: "2002-01-01",
        deviceTypeModel: "unknown",
        result: "CONTAGIOUS",
      },
      middleName: "The",
      role: "Star",
    };
    const action = { type: SET_PATIENT, payload: patientPayload };
    testState["patient"] = patientPayload;
    expect(reducers(undefined, action)).toEqual(testState);
  });
});
