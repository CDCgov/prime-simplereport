import { setDeviceSettings } from "../../devices/state/devicesActions";
import { updateOrganizationSettings } from "../../organizations/state/organizationActions";
import { SETTINGS__UPDATE_SETTINGS } from "./settingsActionTypes";

const _updateSettings = () => {
  return {
    type: SETTINGS__UPDATE_SETTINGS,
  };
};

// TODO: all setting updates should operate as a unit -- everything or nothing should go through
// use Promise.all when introducing async queries
export const updateSettings = (deviceSettings, orgSettings) => {
  return (dispatch) => {
    dispatch(_updateSettings());
    dispatch(setDeviceSettings(deviceSettings));
    dispatch(updateOrganizationSettings(orgSettings));
  };
};
