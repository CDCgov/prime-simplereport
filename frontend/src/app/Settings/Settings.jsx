import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";

import DeviceSettings from "./DeviceSettings";
import { getDevicesArray } from "../devices/deviceSelectors";
import { generateDeviceSettings } from "../devices/utils";
import Button from "../commonComponents/Button";
import { updateSettings } from "../Settings/state/settingsActions";

const Settings = () => {
  const dispatch = useDispatch();
  const devices = useSelector(getDevicesArray);

  console.log(devices);

  const [deviceSettings, updateDeviceSettings] = useState(
    generateDeviceSettings(devices)
  );

  const onSaveSettings = () => {
    // add other setting state here
    console.log("saving settings");
    dispatch(updateSettings(deviceSettings));
  };

  return (
    <main className="prime-home">
      <div className="grid-container">
        <div className="grid-row">
          <h2>Global Settings</h2>
          <Button
            type="button"
            onClick={onSaveSettings}
            label="Save Settings"
          />
        </div>
      </div>
      <DeviceSettings
        deviceSettings={deviceSettings}
        updateDeviceSettings={updateDeviceSettings}
      />
    </main>
  );
};

export default Settings;
