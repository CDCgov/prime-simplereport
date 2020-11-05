import { setDeviceSettings } from "../../devices/state/devicesActions";
import { SETTINGS__UPDATE_SETTINGS } from "./settingsActionTypes";

const _updateSettings = () => {
  return {
    type: SETTINGS__UPDATE_SETTINGS,
  };
};

export const updateSettings = (deviceSettings) => {
  return (dispatch) => {
    dispatch(_updateSettings());
    dispatch(setDeviceSettings(deviceSettings));
  };
};
