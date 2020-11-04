import React, { useState } from "react";
import { useSelector } from "react-redux";

import DeviceSettings from "./DeviceSettings";
import { getDevicesArray } from "../devices/deviceSelectors";
import { generateDeviceSettings } from "../devices/utils";

const Settings = () => {
  const devices = useSelector(getDevicesArray);

  const [deviceSettings, updateDeviceSettings] = useState(
    generateDeviceSettings(devices)
  );

  return (
    <main className="prime-home">
      <div className="grid-container">
        <h2>Global Settings</h2>
      </div>
      <DeviceSettings
        deviceSettings={deviceSettings}
        updateDeviceSettings={updateDeviceSettings}
      />
    </main>
  );
};

export default Settings;
