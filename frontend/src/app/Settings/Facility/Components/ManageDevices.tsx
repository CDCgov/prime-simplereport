import React from "react";

import { FacilityErrors } from "../facilitySchema";
import MultiSelect from "../../../commonComponents/MultiSelect/MultiSelect";
import DeviceSearchResults from "../../../uploads/DeviceLookup/DeviceSearchResults";
import "./ManageDevices.scss";

interface Props {
  deviceTypes: DeviceType[];
  selectedDevices: DeviceType[];
  updateSelectedDevices: (deviceTypes: DeviceType[]) => void;
  // deviceTypes: FacilityFormDeviceType[];
  // selectedDevices: FacilityFormDeviceType[];
  // updateSelectedDevices: (deviceTypes: FacilityFormDeviceType[]) => void;
  errors: FacilityErrors;
  clearError: (field: keyof FacilityErrors) => void;
  newOrg?: boolean;
}

const ManageDevices: React.FC<Props> = ({
  deviceTypes,
  selectedDevices,
  updateSelectedDevices,
  errors,
  clearError,
  newOrg = false,
}) => {
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
    clearError("deviceTypes");
    updateSelectedDevices(getDeviceTypesFromIds(newDeviceIds));
  };

  console.log(JSON.stringify(selectedDevices, null, 4));
  const getInitialValues = selectedDevices.length
    ? selectedDevices.map((device) => device.internalId) || []
    : undefined;

  return (
    <div className="prime-container card-container device-settings">
      <div className="usa-card__header">
        <h2 className="font-heading-lg">Manage devices</h2>
      </div>
      <div className="usa-card__body">
        {newOrg && (
          <p className="usa-form usa-form--large">
            If you plan to upload your results in bulk, enter one device here to
            get started. You can include any additional devices in your
            spreadsheets without adding them here.
          </p>
        )}
        <MultiSelect
          label="Device types"
          name="deviceTypes"
          onChange={(newDeviceIds) => {
            console.log("newDeviceIds", newDeviceIds);
            updateDevices(newDeviceIds);
          }}
          options={getDeviceTypeOptions}
          initialSelectedValues={getInitialValues}
          errorMessage={errors.deviceTypes}
          validationStatus={errors.deviceTypes ? "error" : "success"}
          required
          placeholder="Add device"
          /* TODO: wish I didn't have to do this */
          DropdownComponent={DeviceSearchResults}
          deviceOptions={deviceTypes}
        />
        {!selectedDevices.length && <p> There are currently no devices </p>}
        <p className="usa-hint padding-top-1">
          If you don&rsquo;t see a device you&rsquo;re using, please contact{" "}
          <a href="mailto:support@simplereport.gov">support@simplereport.gov</a>{" "}
          and request to add a new one.
        </p>
      </div>
    </div>
  );
};

export default ManageDevices;
