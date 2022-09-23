import React from "react";

import { FacilityErrors } from "../facilitySchema";
import MultiSelect from "../../../commonComponents/MultiSelect/MultiSelect";

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

  const getDeviceTypeOptions = Array.from(
    deviceTypes.map((device) => ({
      label: device.name,
      value: device.internalId,
    }))
  );

  const getDeviceTypesFromIds = (newDeviceIds: String[]) => {
    return newDeviceIds.length
      ? newDeviceIds.map((deviceId) => {
          return deviceTypes.find(
            (deviceType) => deviceType.internalId === deviceId
          ) as DeviceType;
        })
      : [];
  };

  const updateDevices = (newDeviceIds: String[]) => {
    // validation does not work as expected here,
    // only works on the second selection, not the first;
    // add to props if we decide to use
    // validateField("deviceTypes");
    const newDevices = getDeviceTypesFromIds(newDeviceIds);
    updateSelectedDevices(newDevices);
  };

  const getInitialValues = selectedDevices.length
    ? selectedDevices.map((device) => device.internalId) || []
    : undefined;

  return (
    <div className="prime-container card-container">
      <div className="usa-card__header">
        <h2 className="font-heading-lg">Manage devices</h2>
      </div>
      <div className="usa-card__body">
        <p className="usa-hint padding-top-3">
          If you don&rsquo;t see a device you&rsquo;re using, please contact{" "}
          <a href="mailto:support@simplereport.gov">support@simplereport.gov</a>{" "}
          and request to add a new one.
        </p>
        <MultiSelect
          label="Device Types"
          name="deviceTypes"
          onChange={(newDeviceIds) => {
            updateDevices(newDeviceIds);
          }}
          options={getDeviceTypeOptions}
          initialSelectedValues={getInitialValues}
          // Other option for validation
          // errorMessage={deviceErrors.map((err, index) => { return err})}
          // validationStatus={deviceErrors.length > 0 ? "error" : "success"}
        />
      </div>
      {deviceErrors.length > 0 && (
        <ul className="text-bold text-secondary-vivid margin-top-0">
          {deviceErrors.map((err, index) => (
            <li key={index}>{err}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ManageDevices;
