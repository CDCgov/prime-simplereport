import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { uniqBy } from "lodash";

import Button from "../../../commonComponents/Button/Button";
import Dropdown from "../../../commonComponents/Dropdown";
import Checkboxes from "../../../commonComponents/Checkboxes";
import { FacilityErrors } from "../facilitySchema";
import { ValidateField } from "../FacilityForm";
import { getSpecimenTypesForDevice } from "../../../utils/devices";

interface Props {
  deviceSpecimenTypes: DeviceSpecimenTypeIds[];
  defaultDevice: string;
  updateDeviceSpecimenTypes: (deviceTypes: DeviceSpecimenTypeIds[]) => void;
  updateDefaultDevice: (defaultDevice: string) => void;
  deviceSpecimenTypeOptions: DeviceSpecimenType[];
  errors: FacilityErrors;
  validateField: ValidateField;
}

const ManageDevices: React.FC<Props> = ({
  deviceSpecimenTypes,
  defaultDevice,
  updateDeviceSpecimenTypes,
  updateDefaultDevice,
  deviceSpecimenTypeOptions,
  errors,
  validateField,
}) => {
  const deviceErrors: React.ReactNode[] = [];
  if (errors.deviceTypes) {
    deviceErrors.push(errors.deviceTypes);
  }
  if (errors.defaultDevice) {
    deviceErrors.push(errors.defaultDevice);
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

  const onSpecimenTypeChange = (index: number, newSpecimenId: string) => {
    const newDeviceSpecimenTypes = [...deviceSpecimenTypes];
    newDeviceSpecimenTypes[index] = {
      ...newDeviceSpecimenTypes[index],
      specimenType: newSpecimenId,
    };

    updateDeviceSpecimenTypes(newDeviceSpecimenTypes);
  };

  const onDeviceRemove = (id: string, idx: number) => {
    const newDeviceSpecimenTypes = [...deviceSpecimenTypes];

    newDeviceSpecimenTypes.splice(idx, 1);

    updateDeviceSpecimenTypes(newDeviceSpecimenTypes);
    // Unset default device if ID matches
    if (defaultDevice === id) {
      updateDefaultDevice("");
    }
  };

  // returns a list of deviceIds that have *not* been selected so far
  const _getRemainingDeviceOptions = () =>
    deviceSpecimenTypeOptions
      .map((dst) => dst.deviceType)
      .filter((dst) => !deviceTypeIds.includes(dst));

  const onAddDevice = () => {
    const remainingDeviceOptions = _getRemainingDeviceOptions();
    const newDeviceSpecimenTypes = [...deviceSpecimenTypes];
    newDeviceSpecimenTypes.push({
      deviceType: remainingDeviceOptions[0].internalId,
      specimenType: deviceSpecimenTypeOptions[0].specimenType,
    });

    updateDeviceSpecimenTypes(newDeviceSpecimenTypes);
  };

  const generateDeviceRows = () => {
    return deviceSpecimenTypes.map((dst, idx) => {
      const deviceId = dst.deviceType;

      const devices = deviceSpecimenTypeOptions.map(
        (deviceSpecimenType) => deviceSpecimenType.deviceType
      );
      const specimenTypes = deviceSpecimenTypeOptions
        .filter(
          (deviceSpecimenType) =>
            deviceSpecimenType.deviceType.internalId === deviceId
        )
        .map((deviceSpecimenType) => deviceSpecimenType.specimenType);

      const deviceDropdownOptions = uniqBy(devices, "internalId").map(
        (deviceType) => {
          return {
            label: deviceType.name,
            value: deviceType.internalId,
            disabled: deviceSpecimenTypes
              .map((d) => d.deviceType)
              .includes(deviceType.internalId),
          };
        }
      );

      const specimenDropdownOptions = specimenTypes.map((specimenType) => {
        return {
          label: specimenType.name,
          value: specimenType.internalId,
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
            <Dropdown
              options={specimenDropdownOptions}
              selectedValue={dst.specimenType}
              onChange={(e) =>
                onSpecimenTypeChange(idx, (e.target as HTMLSelectElement).value)
              }
              data-testid={`swab-dropdown-${idx}`}
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
                  label: "Set as default",
                  checked: deviceId === defaultDevice,
                },
              ]}
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
            <th scope="col">Swab type</th>
            <th scope="col"></th>
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
