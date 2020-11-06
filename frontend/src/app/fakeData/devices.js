import { DEVICE_TYPES } from "../devices/constants";

let randomDeviceId = Object.keys(DEVICE_TYPES)[0];

export const initialDevicesState = {
  [randomDeviceId]: {
    displayName: DEVICE_TYPES[randomDeviceId],
    deviceManufacturer: "Abbott",
    deviceModel: "ID NOW",
    isDefault: true,
  },
};
