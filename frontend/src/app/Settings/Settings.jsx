import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";

import Button from "../commonComponents/Button";
import DeviceSettings from "./DeviceSettings";
import OrderingProviderSettings from "./OrderingProviderSettings";
import OrganizationSettings from "./OrganizationSettings";
import { getDevicesArray } from "../devices/deviceSelectors";
import { generateDeviceSettings } from "../devices/utils";
import { getOrganization } from "../organizations/organizationSelector";
import { updateSettings } from "../Settings/state/settingsActions";

const Settings = () => {
  const dispatch = useDispatch();
  const devices = useSelector(getDevicesArray);
  const organization = useSelector(getOrganization);

  const [deviceSettings, updateDeviceSettings] = useState(
    generateDeviceSettings(devices)
  );
  const [orgSettings, updateOrgSettings] = useState(organization);

  const onSaveSettings = () => {
    dispatch(updateSettings(deviceSettings, orgSettings));
  };

  return (
    <main className="prime-home">
      <div className="grid-container">
        <div className="grid-row">
          <h2>Global Settings</h2>
          <Button
            type="button"
            onClick={onSaveSettings}
            label="Save Settings"
          />
        </div>
      </div>
      <OrganizationSettings
        orgSettings={orgSettings}
        updateOrgSettings={updateOrgSettings}
      />
      <OrderingProviderSettings
        orgSettings={orgSettings}
        updateOrgSettings={updateOrgSettings}
      />
      <DeviceSettings
        deviceSettings={deviceSettings}
        updateDeviceSettings={updateDeviceSettings}
      />
    </main>
  );
};

export default Settings;
