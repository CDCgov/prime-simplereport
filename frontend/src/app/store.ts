import { createStore } from "redux";

import { COVID_RESULTS } from "../app/constants";

import { UserPermission } from "./permissions";

const SET_INITIAL_STATE = "SET_INITIAL_STATE";
const UPDATE_ORGANIZATION = "UPDATE_ORGANIZATION";
const SET_PATIENT = "SET_PATIENT";

// this should be the default value for a brand new org
// TODO: get the fields from a schema or something; hard-coded fields are hard to maintain
const initialState = {
  dataLoaded: false,
  organization: {
    name: "",
  },
  facilities: [] as Facility[],
  user: {
    id: "",
    firstName: "",
    middleName: "",
    lastName: "",
    suffix: "",
    email: "",
    permissions: [] as UserPermission[],
    roleDescription: "",
    isAdmin: false,
  },
  patient: {
    internalId: "",
    firstName: "",
    lastName: "",
    middleName: "",
    birthDate: "",
    isDeleted: false,
    role: "",
    lastTest: {
      dateAdded: "",
      result: COVID_RESULTS.INCONCLUSIVE,
      dateTested: "",
      deviceTypeModel: "",
    },
  },
};

const reducers = (state = initialState, action: any) => {
  switch (action.type) {
    case SET_INITIAL_STATE:
      return {
        ...state,
        ...action.payload,
      };
    case UPDATE_ORGANIZATION:
      return {
        ...state,
        organization: {
          ...state.organization,
          ...action.payload,
        },
      };
    case SET_PATIENT:
      return {
        ...state,
        patient: {
          ...action.payload,
        },
      };
    default:
      return state;
  }
};

export const setInitialState = (initialState: any) => {
  return {
    type: SET_INITIAL_STATE,
    payload: initialState,
  };
};

export const updateOrganization = (organization: any) => {
  return {
    type: UPDATE_ORGANIZATION,
    payload: organization,
  };
};

export const setPatient = (patient: any) => {
  return {
    type: SET_PATIENT,
    payload: patient,
  };
};

const configureStore = () => {
  return createStore(
    reducers,
    initialState,
    (window as any).__REDUX_DEVTOOLS_EXTENSION__ &&
      (window as any).__REDUX_DEVTOOLS_EXTENSION__()
  );
};

export const store = configureStore();

export type RootState = ReturnType<typeof store.getState>;
