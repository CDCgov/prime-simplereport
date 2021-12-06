import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { uniqBy } from "lodash";

import Button from "../../../commonComponents/Button/Button";
import Dropdown from "../../../commonComponents/Dropdown";
import { FacilityErrors } from "../facilitySchema";
import { ValidateField } from "../FacilityForm";
import { getSpecimenTypesForDevice } from "../../../utils/devices";

interface Props {
  deviceSpecimenTypes: DeviceSpecimenTypeIds[];
  updateDeviceSpecimenTypes: (deviceTypes: DeviceSpecimenTypeIds[]) => void;
  deviceSpecimenTypeOptions: DeviceSpecimenType[];
  errors: FacilityErrors;
  validateField: ValidateField;
}

const ManageDevices: React.FC<Props> = ({
  deviceSpecimenTypes,
  updateDeviceSpecimenTypes,
  deviceSpecimenTypeOptions,
  errors,
}) => {
  const deviceErrors: React.ReactNode[] = [];
  if (errors.deviceTypes) {
    deviceErrors.push(errors.deviceTypes);
  }

  const deviceTypeIds = deviceSpecimenTypes.map((dst) => dst.deviceType);

  const onDeviceTypeChange = (
    oldDeviceId: string,
    newDeviceId: string,
    idx: number
  ) => {
    const newDeviceSpecimenTypes = [...deviceSpecimenTypes];

    const deviceSpecimens = getSpecimenTypesForDevice(
      newDeviceId,
      deviceSpecimenTypeOptions
    );
    const currentSpecimenType = newDeviceSpecimenTypes[idx].specimenType;

    newDeviceSpecimenTypes[idx] = {
      // Not all specimen types are available on each device, so we may also
      // have to reset the specimen type if the previous one is not supported
      // by the selected device
      specimenType: deviceSpecimens.includes(currentSpecimenType)
        ? currentSpecimenType
        : deviceSpecimens[0],
      deviceType: newDeviceId,
    };

    updateDeviceSpecimenTypes(newDeviceSpecimenTypes);
  };

  const onDeviceRemove = (id: string, idx: number) => {
    const newDeviceSpecimenTypes = [...deviceSpecimenTypes];

    newDeviceSpecimenTypes.splice(idx, 1);

    updateDeviceSpecimenTypes(newDeviceSpecimenTypes);
  };

  // returns a list of deviceIds that have *not* been selected so far
  const _getRemainingDeviceOptions = () =>
    deviceSpecimenTypeOptions.filter(
      (dst) => !deviceTypeIds.includes(dst.deviceType.internalId)
    );

  const onAddDevice = () => {
    const remainingDeviceOptions = _getRemainingDeviceOptions();
    const newDeviceSpecimenTypes = [...deviceSpecimenTypes];
    newDeviceSpecimenTypes.push({
      deviceType: remainingDeviceOptions[0].deviceType.internalId,
      specimenType: remainingDeviceOptions[0].specimenType.internalId,
    });

    updateDeviceSpecimenTypes(newDeviceSpecimenTypes);
  };

  const generateDeviceRows = () => {
    return deviceSpecimenTypes.map((dst, idx) => {
      const deviceId = dst.deviceType;

      const devices = deviceSpecimenTypeOptions.map(
        (deviceSpecimenType) => deviceSpecimenType.deviceType
      );

      const deviceDropdownOptions = uniqBy(devices, "internalId")
        .sort(function alphabetize(a, b) {
          if (a.name < b.name) {
            return -1;
          }

          if (a.name > b.name) {
            return 1;
          }

          return 0;
        })
        .map((deviceType) => {
          return {
            label: deviceType.name,
            value: deviceType.internalId,
            disabled: deviceSpecimenTypes
              .map((d) => d.deviceType)
              .includes(deviceType.internalId),
          };
        });

      return (
        <tr key={idx}>
          <td>
            <Dropdown
              options={deviceDropdownOptions}
              selectedValue={deviceId}
              onChange={(e) =>
                onDeviceTypeChange(
                  deviceId,
                  (e.target as HTMLSelectElement).value,
                  idx
                )
              }
              data-testid={`device-dropdown-${idx}`}
            />
          </td>
          <td>
            <button
              className="usa-button--unstyled"
              onClick={() => onDeviceRemove(deviceId, idx)}
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
    if (Object.keys(deviceSpecimenTypes).length === 0) {
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
