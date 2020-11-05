import { DEVICES__UPDATE_DEVICES } from "./devicesActionTypes";

// this just does a `set` operation
export const updateDeviceSettings = (deviceSettings) => {
  return {
    type: DEVICES__UPDATE_DEVICES,
    payload: {
      deviceSettings,
    },
  };
};
