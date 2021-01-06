import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Button from "../../../commonComponents/Button";
import Dropdown from "../../../commonComponents/Dropdown";
import Checkboxes from "../../../commonComponents/Checkboxes";

interface Props {
  deviceTypes: string[];
  defaultDevice: string;
  updateDeviceTypes: (deviceTypes: string[]) => void;
  updateDefaultDevice: (defaultDevice: string) => void;
  deviceOptions: DeviceType[];
}

const ManageDevices: React.FC<Props> = ({
  deviceTypes,
  defaultDevice,
  updateDeviceTypes,
  updateDefaultDevice,
  deviceOptions,
}) => {
  const onDeviceChange = (oldDeviceId: string, newDeviceId: string) => {
    const newDeviceTypes = Array.from(deviceTypes);
    newDeviceTypes[newDeviceTypes.indexOf(oldDeviceId)] = newDeviceId;
    updateDeviceTypes(newDeviceTypes);
  };

  const onDeviceRemove = (id: string) => {
    const newDeviceTypes = Array.from(deviceTypes);
    newDeviceTypes.splice(newDeviceTypes.indexOf(id), 1);
    updateDeviceTypes(newDeviceTypes);
  };

  // returns a list of deviceIds that have *not* been selected so far
  const _getRemainingDeviceOptions = () =>
    deviceOptions.filter((d) => !deviceTypes.includes(d.internalId));

  const onAddDevice = () => {
    const remainingDeviceOptions = _getRemainingDeviceOptions();
    const newDeviceTypes = Array.from(deviceTypes);
    newDeviceTypes.push(remainingDeviceOptions[0].internalId);
    updateDeviceTypes(newDeviceTypes);
  };

  const generateDeviceRows = () => {
    return deviceTypes.map((deviceId) => {
      let dropdownOptions = deviceOptions.map(({ name, internalId }) => {
        return {
          label: name,
          value: internalId,
          disabled: deviceTypes.includes(internalId),
        };
      });
      return (
        <tr key={deviceId}>
          <td>
            <Dropdown
              options={dropdownOptions}
              selectedValue={deviceId}
              onChange={(e) =>
                onDeviceChange(deviceId, (e.target as HTMLSelectElement).value)
              }
            />
          </td>
          <td>
            <Checkboxes
              onChange={() => updateDefaultDevice(deviceId)}
              legend="Set default"
              legendSrOnly
              name="default_device"
              boxes={[
                {
                  value: "1",
                  label: "Set as Default",
                  checked: deviceId === defaultDevice,
                },
              ]}
            />
          </td>
          <td>
            <div onClick={() => onDeviceRemove(deviceId)}>
              <FontAwesomeIcon icon={"trash"} className={"prime-red-icon"} />
            </div>
          </td>
        </tr>
      );
    });
  };

  const renderDevicesTable = () => {
    if (Object.keys(deviceTypes).length === 0) {
      return <p> There are currently no devices </p>;
    }
    return (
      <table
        className="usa-table usa-table--borderless"
        style={{ width: "100%" }}
      >
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
    <div className="prime-container usa-card__container">
      <div className="usa-card__header">
        <h3> Manage Devices </h3>
      </div>
      <div className="usa-card__body">{renderDevicesTable()}</div>
      <div className="usa-card__footer">
        <Button
          onClick={onAddDevice}
          variant="outline"
          label="Add Device"
          icon="plus"
          disabled={_getRemainingDeviceOptions().length === 0}
        />
      </div>
    </div>
  );
};

export default ManageDevices;
