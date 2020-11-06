import { ORGANIZATION__UPDATE_SETTINGS } from "./organizationActionTypes";

const initialState = {};

export default (state = initialState, action) => {
  switch (action.type) {
    case ORGANIZATION__UPDATE_SETTINGS:
      return {
        ...state,
        ...action.payload.organizationSettings,
      };
    default:
      return state;
  }
};
