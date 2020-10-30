import { createSelector } from "reselect";

export const getDevices = (state) => state.devices;

export const getDevicesArray = createSelector(getDevices, (devices) => {
  if (Object.keys(devices).length === 0) {
    return [];
  }
  return Object.entries(devices).map(([deviceId, device]) => ({
    deviceId,
    ...device,
  }));
});
