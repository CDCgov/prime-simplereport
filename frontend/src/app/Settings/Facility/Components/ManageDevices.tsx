import React from "react";

import MultiSelect from "../../../commonComponents/MultiSelect/MultiSelect";
import { RegistrationProps } from "../../../commonComponents/MultiSelect/MultiSelectDropdown/MultiSelectDropdown";
import { FacilityFormData } from "../FacilityForm";

interface Props {
  deviceTypes: FacilityFormDeviceType[];
  errors: any;
  newOrg?: boolean;
  formCurrentValues: FacilityFormData;
  registrationProps: RegistrationProps;
  onChange: (selectedItems: string[]) => void;
}

const ManageDevices: React.FC<Props> = ({
  deviceTypes,
  errors,
  newOrg = false,
  formCurrentValues,
  onChange,
  registrationProps,
}) => {
  const getDeviceTypeOptions = Array.from(
    deviceTypes.map((device) => ({
      label: device.name,
      value: device.internalId,
    }))
  );

  return (
    <div className="prime-container card-container">
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
          onChange={onChange}
          options={getDeviceTypeOptions}
          initialSelectedValues={formCurrentValues.devices}
          validationStatus={errors?.devices?.type ? "error" : "success"}
          required
          placeholder="Add device"
          errorMessage={errors?.devices?.message}
          registrationProps={registrationProps}
        />
        {formCurrentValues.devices.length === 0 && (
          <p> There are currently no devices </p>
        )}
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
