import React, { useState } from "react";
import { useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
// import { useSelector, useDispatch } from "react-redux";
// import { clearNotification } from "./state/testQueueActions";

// import Alert from "../commonComponents/Alert";
// import { getPatientById } from "../patients/patientSelectors";
// import Expire from "../commonComponents/Expire";
// import { getQueueNotification } from "../testQueue/testQueueSelectors";
// import Devices from "./Devices";
import { getDevicesArray } from "../devices/deviceSelectors";
import Dropdown from "../commonComponents//Dropdown";
import { DEVICE_TYPES } from "../devices/constants";
import { useEffect } from "react";

const generateDevieSettings = (devices) => {
  return devices.reduce((acc, device) => {
    let name = `device-${uuidv4()}`; // assign a dynamic name to each device
    acc[name] = device;
    return acc;
  }, {});
};

const DeviceSettings = () => {
  const devices = useSelector(getDevicesArray);

  const [deviceSettings, updateDeviceSettings] = useState(
    generateDevieSettings(devices)
  );

  const onDeviceChange = (e) => {
    let changedDeviceName = e.target.name;
    let newDeviceId = e.target.value;
    let newDeviceSettings = {
      ...deviceSettings,
      [changedDeviceName]: {
        ...deviceSettings[changedDeviceName],
        deviceId: newDeviceId,
        displayName: DEVICE_TYPES[newDeviceId],
      },
    };
    updateDeviceSettings(newDeviceSettings);
  };

  const dropdownOptions = Object.entries(DEVICE_TYPES).map(
    ([deviceId, displayName]) => ({
      label: displayName,
      value: deviceId,
    })
  );

  const renderDevicesTable = () => {
    if (Object.keys(deviceSettings).length === 0) {
      return <p> There are curreently no devices </p>;
    }
    let deviceRows = Object.entries(deviceSettings).map(([name, device]) => {
      let dropdown = (
        <Dropdown
          options={dropdownOptions}
          name={name}
          selectedValue={device.deviceId}
          onChange={onDeviceChange}
        />
      );
      return (
        <tr key={uuidv4()}>
          <td>{dropdown}</td>
          <td>is default</td>
          <td>trash</td>
        </tr>
      );
    });
    return (
      <table className="usa-table usa-table--borderless">
        <thead>
          <tr>
            <th scope="col">Device Type</th>
            <th scope="col"></th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>{deviceRows}</tbody>
      </table>
    );
  };

  return (
    <div className="grid-container">
      <div className="grid-row">
        <div className="prime-container usa-card__container">
          <div className="usa-card__header">
            <h3> Manage Devices </h3>
          </div>
          <div className="usa-card__body">{renderDevicesTable()}</div>
        </div>
      </div>
    </div>
  );
};

export default DeviceSettings;
