import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { gql, useQuery } from "@apollo/client";

import Button from "../commonComponents/Button";
import DeviceSettings from "./DeviceSettings";
import OrderingProviderSettings from "./OrderingProviderSettings";
import OrganizationSettings from "./OrganizationSettings";
import { generateDeviceSettings } from "../devices/utils";
import { updateSettings } from "../Settings/state/settingsActions";
import { useEffect } from "react";

const getDevicesQuery = gql`
  {
    device {
      id
      displayName
      deviceModel
      deviceManufacturer
      isDefault
    }
    organization {
      id
      cliaNumber
      testingFacilityName
      orderingProviderNPI
      orderingProviderName
      orderingProviderStreet
      orderingProviderStreetTwo
      orderingProviderCity
      orderingProviderZipCode
      orderingProviderCounty
      orderingProviderState
      orderingProviderPhone
    }
  }
`;

const Settings = () => {
  const dispatch = useDispatch();
  const { data, loading, error } = useQuery(getDevicesQuery);

  const [deviceSettings, updateDeviceSettings] = useState({});
  const [orgSettings, updateOrgSettings] = useState({});

  useEffect(() => {
    if (data) {
      updateDeviceSettings(generateDeviceSettings(data.device));
      updateOrgSettings(data.organization);
    }
  }, [data]);

  const onSaveSettings = () => {
    dispatch(updateSettings(deviceSettings, orgSettings));
  };

  if (error) {
    return <p> There was an error </p>;
  }
  if (loading) {
    return <p> Loading... </p>;
  }

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
