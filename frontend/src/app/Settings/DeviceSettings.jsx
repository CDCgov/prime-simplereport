import React from "react";
import { v4 as uuidv4 } from "uuid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { gql, useQuery } from "@apollo/client";
import PropTypes from "prop-types";

import Button from "../commonComponents/Button";
import Dropdown from "../commonComponents//Dropdown";
import RadioGroup from "../commonComponents/RadioGroup";

const getAllDevices = gql`
  {
    device {
      id
      displayName
    }
  }
`;

const DeviceSettings = ({ deviceSettings, updateDeviceSettings }) => {
  const {
    data: allDevices,
    loading: isLoadingAllDevices,
    error: errorFetchingAllDevices,
  } = useQuery(getAllDevices);

  let isLoading =
    Object.keys(deviceSettings).length === 0 || isLoadingAllDevices;

  if (isLoading) {
    return (
      <div className="grid-container">
        <div className="grid-row">
          <div className="prime-container usa-card__container">
            <div className="usa-card__header">
              <h3> Manage Devices </h3>
            </div>
            <div className="usa-card__body">Devices are loading...</div>
          </div>
        </div>
      </div>
    );
  }

  let dropdownOptions;
  if (allDevices) {
    dropdownOptions = allDevices.device.map((device) => ({
      label: device.displayName,
      value: device.id,
    }));
  }

  const onDeviceChange = (e) => {
    let name = e.target.name;
    let newDeviceId = e.target.value;

    let newDeviceSettings = {
      ...deviceSettings,
      supportedDevices: {
        ...deviceSettings.supportedDevices,
        [name]: newDeviceId,
      },
    };
    updateDeviceSettings(newDeviceSettings);
  };

  const onDefaultChange = (e) => {
    let name = e.target.name;
    let deviceId = deviceSettings.supportedDevices[name];

    let newDeviceSettings = {
      ...deviceSettings,
      defaultDeviceId:
        deviceSettings.defaultDeviceId === deviceId ? null : deviceId,
    };

    updateDeviceSettings(newDeviceSettings);
  };

  const onDeviceRemove = (name) => {
    let newDeviceSettings = {
      ...deviceSettings,
    };
    delete newDeviceSettings.supportedDevices[name];
    updateDeviceSettings(newDeviceSettings);
  };

  // returns a list of deviceIds that have *not* been selected so far
  const _getRemainingDeviceOptions = () => {
    let supportedDeviceIds = Object.values(deviceSettings.supportedDevices);

    return allDevices.device.filter((d) => !supportedDeviceIds.includes(d.id));
  };

  const onAddDevice = () => {
    let remainingDeviceOptions = _getRemainingDeviceOptions();

    let newDeviceName = `device-${uuidv4()}`;
    let newDeviceId = remainingDeviceOptions[0].id;
    let newDeviceSettings = {
      ...deviceSettings,
      supportedDevices: {
        ...deviceSettings.supportedDevices,
        [newDeviceName]: newDeviceId,
      },
    };
    updateDeviceSettings(newDeviceSettings);
  };

  const generateDeviceRows = () => {
    return Object.entries(deviceSettings.supportedDevices).map(
      ([name, supportedDeviceId]) => (
        <tr key={uuidv4()}>
          <td>
            <Dropdown
              options={dropdownOptions}
              name={name}
              selectedValue={supportedDeviceId}
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
              selectedRadio={
                supportedDeviceId === deviceSettings.defaultDeviceId
                  ? "true"
                  : "false"
              }
              name={name}
            />
          </td>
          <td>
            <div onClick={() => onDeviceRemove(name)}>
              <FontAwesomeIcon icon={"trash"} className={"prime-red-icon"} />
            </div>
          </td>
        </tr>
      )
    );
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
              disabled={_getRemainingDeviceOptions().length === 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

DeviceSettings.propTypes = {
  updateDeviceSettings: PropTypes.func,
  deviceSettings: PropTypes.shape({
    defaultDeviceId: PropTypes.string,
    supportedDevices: PropTypes.objectOf(PropTypes.string),
  }),
  allDevices: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      displayName: PropTypes.string,
    })
  ),
};

export default DeviceSettings;
