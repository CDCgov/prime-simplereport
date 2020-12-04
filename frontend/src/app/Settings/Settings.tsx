import React, { useState } from "react";

import Button from "../commonComponents/Button";
import DeviceTypes from "./DeviceTypes";
import OrderingProviderSettings from "./OrderingProvider";
import FacilityInformation from "./FacilityInformation";

interface Props {
  organization: Organization;
  deviceOptions: DeviceType[];
  saveSettings: (organization: Organization) => void;
}

const Settings: React.FC<Props> = (props) => {
  const [organization, updateOrganization] = useState<Organization>(
    props.organization
  );
  const [formChanged, updateFormChanged] = useState<boolean>(false);

  const updateOrgSettingsHandler = (data: Organization) => {
    updateOrganization(data);
    updateFormChanged(true);
  };

  const updateFacility = (testingFacility: Facility) => {
    updateOrgSettingsHandler({
      ...organization,
      testingFacility,
    });
  };

  const updateProvider = (orderingProvider: Provider) => {
    updateOrgSettingsHandler({
      ...organization,
      orderingProvider,
    });
  };

  const updateDeviceTypes = (deviceTypes: string[]) => {
    updateOrgSettingsHandler({
      ...organization,
      deviceTypes,
    });
  };

  const updateDefaultDevice = (defaultDevice: string) => {
    updateOrgSettingsHandler({
      ...organization,
      defaultDevice,
    });
  };
  return (
    <main className="prime-home">
      <div className="grid-container">
        <div className="grid-row">
          <h2>Global Settings</h2>
          <Button
            type="button"
            onClick={() => props.saveSettings(organization)}
            label="Save Settings"
            disabled={!formChanged}
          />
        </div>
      </div>
      <FacilityInformation
        facility={organization.testingFacility}
        updateFacility={updateFacility}
      />
      <OrderingProviderSettings
        provider={organization.orderingProvider}
        updateProvider={updateProvider}
      />
      <DeviceTypes
        deviceTypes={organization.deviceTypes}
        defaultDevice={organization.defaultDevice}
        updateDeviceTypes={updateDeviceTypes}
        updateDefaultDevice={updateDefaultDevice}
        deviceOptions={props.deviceOptions}
      />
    </main>
  );
};

export default Settings;
