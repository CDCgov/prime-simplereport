import { createStore } from "redux";
import { TypedUseSelectorHook, useSelector } from "react-redux";

import { COVID_RESULTS } from "../app/constants";
import { UserPermission } from "../generated/graphql";
import { VerifyV2Response } from "../patientApp/PxpApiService";

export const SET_INITIAL_STATE = "SET_INITIAL_STATE";
export const UPDATE_ORGANIZATION = "UPDATE_ORGANIZATION";
export const UPDATE_FACILITY = "UPDATE_FACILITY";
export const SET_PATIENT = "SET_PATIENT";
export const SET_TEST_RESULT = "SET_TEST_RESULT";

// this should be the default value for a brand new org
// TODO: get the fields from a schema or something; hard-coded fields are hard to maintain
export const initialState = {
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
      deviceTypeName: "",
      facilityName: "",
    },
  },
  testResult: {} as VerifyV2Response,
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
    case UPDATE_FACILITY:
      // eslint-disable-next-line no-case-declarations
      const facilityIndex = state.facilities.findIndex(
        (f) => f.id === action.payload.id
      );
      if (facilityIndex > -1) {
        state.facilities[facilityIndex] = action.payload;
      } else {
        state.facilities.push(action.payload);
      }
      return {
        ...state,
        facilities: state.facilities,
      };
    case SET_PATIENT:
      return {
        ...state,
        patient: {
          ...action.payload,
        },
      };
    case SET_TEST_RESULT:
      return {
        ...state,
        testResult: {
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

export const updateFacility = (facility: any) => {
  return {
    type: UPDATE_FACILITY,
    payload: facility,
  };
};

export const setPatient = (patient: any) => {
  return {
    type: SET_PATIENT,
    payload: patient,
  };
};

export const setTestResult = (testResult: VerifyV2Response) => {
  return {
    type: SET_TEST_RESULT,
    payload: testResult,
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

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default reducers;
