import React, { useState } from "react";
// import { useDispatch } from "react-redux";
import { gql, useQuery, useMutation } from "@apollo/client";
import { v4 as uuidv4 } from "uuid";

import Button from "../commonComponents/Button";
import DeviceSettings from "./DeviceSettings";
import OrderingProviderSettings from "./OrderingProviderSettings";
import OrganizationSettings from "./OrganizationSettings";
// import { updateSettings } from "../Settings/state/settingsActions";
import { useEffect } from "react";

const getSettings = gql`
  {
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
      defaultDevice
      devices {
        id
      }
    }
  }
`;

const setSettings = gql`
  mutation(
    $name: String
    $clia: String
    $orderingProviderName: String
    $orderingProviderNPI: String
    $orderingProviderStreet: String
    $orderingProviderStreetTwo: String
    $orderingProviderCity: String
    $orderingProviderCounty: String
    $orderingProviderState: String
    $orderingProviderZipCode: String
    $orderingProviderPhone: String
    $devices: [String]
    $defaultDevice: String
  ) {
    updateOrganization(
      testingFacilityName: $name
      cliaNumber: $clia
      orderingProviderName: $orderingProviderName
      orderingProviderNPI: $orderingProviderNPI
      orderingProviderStreet: $orderingProviderStreet
      orderingProviderStreetTwo: $orderingProviderStreetTwo
      orderingProviderCity: $orderingProviderCity
      orderingProviderCounty: $orderingProviderCounty
      orderingProviderState: $orderingProviderState
      orderingProviderZipCode: $orderingProviderZipCode
      orderingProviderPhone: $orderingProviderPhone
      devices: $devices
      defaultDevice: $defaultDevice
    )
  }
`;

const Settings = () => {
  // const dispatch = useDispatch();
  const {
    data: settings,
    loading: isLoadingSettings,
    error: errorFetchingSettings,
  } = useQuery(getSettings);

  const [saveSettings, { as }] = useMutation(setSettings);

  const [deviceSettings, updateDeviceSettings] = useState({});
  const [orgSettings, updateOrgSettings] = useState({});

  useEffect(() => {
    if (settings) {
      let supportedDevices = settings.organization.devices.reduce(
        (acc, device) => {
          let name = `device-${uuidv4()}`;
          acc[name] = device.id;
          return acc;
        },
        {}
      );

      let deviceSettings = {
        supportedDevices: supportedDevices,
        defaultDeviceId: settings.organization.defaultDevice,
      };
      updateDeviceSettings(deviceSettings);
    }
  }, [settings]);

  const onSaveSettings = () => {
    console.log("deviceSettings", deviceSettings);
    console.log("orgSettings", orgSettings);
    // dispatch(updateSettings(deviceSettings, orgSettings));
  };

  if (isLoadingSettings) {
    return <p> Loading... </p>;
  }
  if (errorFetchingSettings) {
    console.log(errorFetchingSettings);
    return <p> There was an error </p>;
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
