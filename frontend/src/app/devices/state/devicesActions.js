import { DEVICES__SET_DEVICE_SETTINGS } from "./devicesActionTypes";

//
export const setDeviceSettings = (deviceSettings) => {
  return {
    type: DEVICES__SET_DEVICE_SETTINGS,
    payload: {
      deviceSettings,
    },
  };
};
