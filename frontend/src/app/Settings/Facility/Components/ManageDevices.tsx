import React, { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Button from "../../../commonComponents/Button/Button";
import Dropdown from "../../../commonComponents/Dropdown";
import { FacilityErrors } from "../facilitySchema";

interface Props {
  deviceTypes: DeviceType[];
  selectedDevices: DeviceType[];
  updateSelectedDevices: (deviceTypes: DeviceType[]) => void;
  errors: FacilityErrors;
}

const ManageDevices: React.FC<Props> = ({
  deviceTypes,
  selectedDevices,
  updateSelectedDevices,
  errors,
}) => {
  const deviceErrors: React.ReactNode[] = [];

  if (errors.deviceTypes) {
    deviceErrors.push(errors.deviceTypes);
  }

  const selectedDevicesOrDefault = useMemo(
    () => (selectedDevices.length > 0 ? selectedDevices : []),
    [selectedDevices]
  );

  const selectedDeviceTypeIds = selectedDevicesOrDefault.map(
    (d) => d.internalId
  );

  const onDeviceTypeChange = (newDeviceId: string, idx: number) => {
    const newDeviceTypes = [...selectedDevicesOrDefault];

    newDeviceTypes[idx] = deviceTypes.find(
      (d) => d.internalId === newDeviceId
    ) as DeviceType;

    updateSelectedDevices(newDeviceTypes);
  };

  const onDeviceRemove = (idx: number) => {
    const newDeviceSpecimenTypes = [...selectedDevicesOrDefault];

    newDeviceSpecimenTypes.splice(idx, 1);

    updateSelectedDevices(newDeviceSpecimenTypes);
  };

  // returns a list of deviceIds that have *not* been selected so far
  const _getRemainingDeviceOptions = () =>
    deviceTypes
      .filter((device) => !selectedDeviceTypeIds.includes(device.internalId))
      .sort((a, b) => a.name.localeCompare(b.name));

  const onAddDevice = () => {
    const remainingDeviceOptions = _getRemainingDeviceOptions();
    const newDeviceTypes = [...selectedDevicesOrDefault];
    newDeviceTypes.push(remainingDeviceOptions[0]);

    updateSelectedDevices(newDeviceTypes);
  };

  const generateDeviceRows = () => {
    return selectedDevicesOrDefault.map((device, idx) => {
      const deviceId = device.internalId;

      const deviceDropdownOptions = [...(deviceTypes || [])]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((deviceType) => {
          return {
            label: deviceType.name,
            value: deviceType.internalId,
            disabled: selectedDevicesOrDefault
              .map((d) => d.internalId)
              .includes(deviceType.internalId),
          };
        });

      return (
        <tr key={idx}>
          <td>
            <Dropdown
              className="padding-0 margin-0"
              options={deviceDropdownOptions}
              selectedValue={deviceId}
              onChange={(e) =>
                onDeviceTypeChange((e.target as HTMLSelectElement).value, idx)
              }
              data-testid={`device-dropdown-${idx}`}
            />
          </td>
          <td>
            <button
              className="usa-button--unstyled margin-top-05em margin-left-2"
              onClick={() => onDeviceRemove(idx)}
              aria-label="Delete device"
            >
              <FontAwesomeIcon icon={"trash"} className={"prime-red-icon"} />
            </button>
          </td>
        </tr>
      );
    });
  };

  const renderDevicesTable = () => {
    if (Object.keys(selectedDevicesOrDefault).length === 0) {
      return <p> There are currently no devices </p>;
    }
    return (
      <table
        className="usa-table usa-table--borderless"
        style={{ width: "100%" }}
      >
        <thead>
          <tr>
            <th scope="col">Device type</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>{generateDeviceRows()}</tbody>
      </table>
    );
  };

  return (
    <div className="prime-container card-container">
      <div className="usa-card__header">
        <h2 className="font-heading-lg">Manage devices</h2>
      </div>
      {deviceErrors.length > 0 && (
        <ul className="text-bold text-secondary-vivid">
          {deviceErrors.map((err, index) => (
            <li key={index}>{err}</li>
          ))}
        </ul>
      )}
      <div className="usa-card__body">{renderDevicesTable()}</div>
      <div className="usa-card__footer">
        <Button
          onClick={onAddDevice}
          variant="outline"
          label="Add device"
          icon="plus"
          disabled={_getRemainingDeviceOptions().length === 0}
        />
      </div>
    </div>
  );
};

export default ManageDevices;
