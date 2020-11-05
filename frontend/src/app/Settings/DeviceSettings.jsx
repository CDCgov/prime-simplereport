import React from "react";
import { v4 as uuidv4 } from "uuid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Button from "../commonComponents/Button";
import Dropdown from "../commonComponents//Dropdown";
import RadioGroup from "../commonComponents/RadioGroup";
import { DEVICE_TYPES } from "../devices/constants";
import { createNewDevice } from "../devices/utils";

const dropdownOptions = Object.entries(DEVICE_TYPES).map(
  ([deviceId, displayName]) => ({
    label: displayName,
    value: deviceId,
  })
);

const DeviceSettings = ({ deviceSettings, updateDeviceSettings }) => {
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

  const onDefaultChange = (e) => {
    let changedDeviceName = e.target.name;
    let isDefault = !deviceSettings[changedDeviceName].isDefault;

    let newDeviceSettings = {};
    Object.entries(deviceSettings).forEach(([name, device]) => {
      newDeviceSettings[name] = {
        ...device,
        isDefault: false,
      };
    });
    newDeviceSettings[changedDeviceName] = {
      ...deviceSettings[changedDeviceName],
      isDefault,
    };

    updateDeviceSettings(newDeviceSettings);
  };

  const onDeviceRemove = (deviceName) => {
    let newDeviceSettings = {
      ...deviceSettings,
    };
    delete newDeviceSettings[deviceName];
    updateDeviceSettings(newDeviceSettings);
  };

  const onAddDevice = (deviceId) => {
    let name = `device-${uuidv4()}`;
    let newDeviceSettings = {
      ...deviceSettings,
      [name]: createNewDevice(deviceId),
    };
    updateDeviceSettings(newDeviceSettings);
  };

  const generateDeviceRows = () => {
    return Object.entries(deviceSettings).map(([name, device]) => (
      <tr key={uuidv4()}>
        <td>
          <Dropdown
            options={dropdownOptions}
            name={name}
            selectedValue={device.deviceId}
            onChange={onDeviceChange}
          />
        </td>
        <td>
          <RadioGroup
            type="checkbox"
            onChange={onDefaultChange}
            buttons={[
              {
                value: "true",
                label: "Set as Default",
              },
            ]}
            selectedRadio={device.isDefault ? "true" : "false"}
            name={name}
          />
        </td>
        <td>
          <div onClick={() => onDeviceRemove(name)}>
            <FontAwesomeIcon icon={"trash"} className={"prime-red-icon"} />
          </div>
        </td>
      </tr>
    ));
  };

  const renderDevicesTable = () => {
    if (Object.keys(deviceSettings).length === 0) {
      return <p> There are currently no devices </p>;
    }
    return (
      <table className="usa-table usa-table--borderless">
        <thead>
          <tr>
            <th scope="col">Device Type</th>
            <th scope="col"></th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>{generateDeviceRows()}</tbody>
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
          <div className="usa-card__footer">
            <Button
              onClick={onAddDevice}
              type="submit"
              outline
              label="Add Another Device"
              icon="plus"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceSettings;
