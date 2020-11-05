import { DEVICES__SET_DEVICE_SETTINGS } from "./devicesActionTypes";

const initialState = {};

export default (state = initialState, action) => {
  switch (action.type) {
    case DEVICES__SET_DEVICE_SETTINGS:
      return action.payload.deviceSettings;
    default:
      return state;
  }
};
