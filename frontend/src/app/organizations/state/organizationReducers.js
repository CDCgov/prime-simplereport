import { ORGANIZATION__UPDATE_SETTINGS } from "./organizationActionTypes";

// this should be the default value for a brand new org
// TODO: get the fields from a schema or something; hard-coded fields are hard to maintain
const initialState = {};
export default (state = initialState, action) => {
  switch (action.type) {
    case ORGANIZATION__UPDATE_SETTINGS:
      return {
        ...action.payload.organizationSettings,
      };
    default:
      return state;
  }
};
