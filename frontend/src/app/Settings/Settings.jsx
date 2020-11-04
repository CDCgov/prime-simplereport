import React, { useState } from "react";
import { useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";

import DeviceSettings from "./DeviceSettings";
import { getDevicesArray } from "../devices/deviceSelectors";
import { DEVICE_TYPES } from "../devices/constants";

const generateDeviceSettings = (devices) => {
  return devices.reduce((acc, device) => {
    let name = `device-${uuidv4()}`; // assign a dynamic name to each device
    acc[name] = device;
    return acc;
  }, {});
};

const generateDevice = () => {
  let deviceId = Object.keys(DEVICE_TYPES)[0]; // randomlly pick one
  return {
    deviceId,
    displayName: DEVICE_TYPES[deviceId],
    isDefault: false,
  };
};

const Settings = () => {
  const devices = useSelector(getDevicesArray);

  const [deviceSettings, updateDeviceSettings] = useState(
    generateDeviceSettings(devices)
  );

  const addDevice = (deviceId) => {
    let name = `device-${uuidv4()}`;
    let newDeviceSettings = {
      ...deviceSettings,
      [name]: generateDevice(deviceId),
    };
    updateDeviceSettings(newDeviceSettings);
  };
  return (
    <main className="prime-home">
      <div className="grid-container">
        <h2>Global Settings</h2>
      </div>
      <DeviceSettings
        deviceSettings={deviceSettings}
        updateDeviceSettings={updateDeviceSettings}
        addDevice={addDevice}
      />
    </main>
  );
};

export default Settings;
