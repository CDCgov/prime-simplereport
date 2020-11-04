import { v4 as uuidv4 } from "uuid";
import { DEVICE_TYPES } from "./constants";

export const generateDeviceSettings = (devices) => {
  return devices.reduce((acc, device) => {
    let name = `device-${uuidv4()}`; // assign a dynamic name to each device
    acc[name] = device;
    return acc;
  }, {});
};

export const createNewDevice = () => {
  let deviceId = Object.keys(DEVICE_TYPES)[0]; // doesn't matter, just pick one
  return {
    deviceId,
    displayName: DEVICE_TYPES[deviceId],
    isDefault: false,
  };
};
