import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Button from "../../../commonComponents/Button/Button";
import Dropdown from "../../../commonComponents/Dropdown";
import Checkboxes from "../../../commonComponents/Checkboxes";
import { FacilityErrors } from "../facilitySchema";
import { ValidateField } from "../FacilityForm";

interface Props {
  deviceSpecimenTypes: DeviceSpecimenType[];
  defaultDevice: string;
  updateDeviceSpecimenTypes: (deviceTypes: DeviceSpecimenType[]) => void;
  updateDefaultDevice: (defaultDevice: string) => void;
  /*
  deviceOptions: DeviceType[];
  specimenOptions: SpecimenType[];
  */
  deviceSpecimenTypeOptions: DeviceSpecimenType[];
  errors: FacilityErrors;
  validateField: ValidateField;
}

const ManageDevices: React.FC<Props> = ({
  deviceSpecimenTypes,
  defaultDevice,
  updateDeviceSpecimenTypes,
  updateDefaultDevice,
  /*
  deviceOptions,
  specimenOptions,
  */
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

  const onDeviceTypeChange = (oldDeviceId: string, newDeviceId: string) => {
    const newDeviceSpecimenTypes = [...deviceSpecimenTypes];
    const deviceIndex = newDeviceSpecimenTypes.findIndex(
      (el) => el.deviceType === oldDeviceId
    );
    newDeviceSpecimenTypes[deviceIndex] = {
      ...newDeviceSpecimenTypes[deviceIndex],
      deviceType: newDeviceId,
    };

    updateDeviceSpecimenTypes(newDeviceSpecimenTypes);
  };

  const onSpecimenTypeChange = (
    index: number,
    newSpecimenId: string
  ) => {
    const newDeviceSpecimenTypes = [...deviceSpecimenTypes];
    newDeviceSpecimenTypes[index] = {
      ...newDeviceSpecimenTypes[index],
      specimenType: newSpecimenId,
    };

    updateDeviceSpecimenTypes(newDeviceSpecimenTypes);
  };

  const onDeviceRemove = (id: string) => {
    const newDeviceSpecimenTypes = [...deviceSpecimenTypes];
    const deviceIndex = newDeviceSpecimenTypes.findIndex(
      (el) => el.deviceType === id
    );
    newDeviceSpecimenTypes.splice(deviceIndex, 1);

    updateDeviceSpecimenTypes(newDeviceSpecimenTypes);
    // Unset default device if ID matches
    if (defaultDevice === id) {
      updateDefaultDevice("");
    }
  };

  // returns a list of deviceIds that have *not* been selected so far
  const _getRemainingDeviceOptions = () =>
    deviceOptions.filter((d) => !deviceTypeIds.includes(d.internalId));

  const onAddDevice = () => {
    const remainingDeviceOptions = _getRemainingDeviceOptions();
    const newDeviceSpecimenTypes = [...deviceSpecimenTypes];
    newDeviceSpecimenTypes.push({
      deviceType: remainingDeviceOptions[0].internalId,
      specimenType: specimenOptions[0].internalId
    });

    updateDeviceSpecimenTypes(newDeviceSpecimenTypes);
  };

  const generateDeviceRows = () => {
    return deviceSpecimenTypes.map((dst, idx) => {
      const deviceId = dst.deviceType;

      const deviceDropdownOptions = deviceOptions.map(
        ({ name, internalId }) => {
          return {
            label: name,
            value: internalId,
            disabled: deviceSpecimenTypes
              .map((d) => d.deviceType)
              .includes(internalId),
          };
        }
      );

      const specimenDropdownOptions = specimenOptions.map(
        ({ name, internalId }) => {
          return {
            label: name,
            value: internalId,
          };
        }
      );

      return (
        <tr key={deviceId}>
          <td>
            <Dropdown
              options={deviceDropdownOptions}
              selectedValue={deviceId}
              onChange={(e) =>
                onDeviceTypeChange(
                  deviceId,
                  (e.target as HTMLSelectElement).value
                )
              }
            />
          </td>
          <td>
            <Dropdown
              options={specimenDropdownOptions}
              selectedValue={dst.specimenType}
              onChange={(e) =>
                onSpecimenTypeChange(idx, (e.target as HTMLSelectElement).value)
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
                  label: "Set as default",
                  checked: deviceId === defaultDevice,
                },
              ]}
            />
          </td>
          <td>
            <button
              className="usa-button--unstyled"
              onClick={() => onDeviceRemove(deviceId)}
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
