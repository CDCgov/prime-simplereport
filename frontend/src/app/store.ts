import { createStore } from "redux";

const SET_INITIAL_STATE = "SET_INITIAL_STATE";
const UPDATE_ORGANIZATION = "UPDATE_ORGANIZATION";

// this should be the default value for a brand new org
// TODO: get the fields from a schema or something; hard-coded fields are hard to maintain
const initialState = {
  organization: {
    name: "",
  },
  facilities: [],
  facility: {
    id: "",
    name: "",
  },
  user: {
    id: "",
    firstName: "",
    middleName: "",
    lastName: "",
    suffix: "",
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
        }
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

const configureStore = () => {
  return createStore(reducers, initialState);
};

export const store = configureStore();
