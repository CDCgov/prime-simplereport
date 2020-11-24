import React, { useState } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import { useEffect } from "react";

import Alert from "../commonComponents/Alert";
import Button from "../commonComponents/Button";
import DeviceSettings from "./DeviceSettings";
import OrderingProviderSettings from "./OrderingProviderSettings";
import OrganizationSettings from "./OrganizationSettings";
import { showNotification } from "../utils";

const GET_SETTINGS_QUERY = gql`
  {
    organization {
      internalId
      cliaNumber
      testingFacilityName
      orderingProviderNPI
      orderingProviderFirstName
      orderingProviderMiddleName
      orderingProviderLastName
      orderingProviderSuffix
      orderingProviderStreet
      orderingProviderStreetTwo
      orderingProviderCity
      orderingProviderZipCode
      orderingProviderCounty
      orderingProviderState
      orderingProviderPhone
      defaultDeviceType {
        internalId
      }
      deviceTypes {
        internalId
      }
    }
  }
`;

const SET_SETTINGS_MUTATION = gql`
  mutation(
    $testingFacilityName: String!
    $cliaNumber: String
    $orderingProviderFirstName: String!
    $orderingProviderMiddleName: String
    $orderingProviderLastName: String!
    $orderingProviderSuffix: String
    $orderingProviderNPI: String!
    $orderingProviderStreet: String
    $orderingProviderStreetTwo: String
    $orderingProviderCity: String
    $orderingProviderCounty: String
    $orderingProviderState: String
    $orderingProviderZipCode: String!
    $orderingProviderPhone: String
    $devices: [String]!
    $defaultDevice: String!
  ) {
    updateOrganization(
      testingFacilityName: $testingFacilityName
      cliaNumber: $cliaNumber
      orderingProviderFirstName: $orderingProviderFirstName
      orderingProviderMiddleName: $orderingProviderMiddleName
      orderingProviderLastName: $orderingProviderLastName
      orderingProviderSuffix: $orderingProviderSuffix
      orderingProviderNPI: $orderingProviderNPI
      orderingProviderStreet: $orderingProviderStreet
      orderingProviderStreetTwo: $orderingProviderStreetTwo
      orderingProviderCity: $orderingProviderCity
      orderingProviderCounty: $orderingProviderCounty
      orderingProviderState: $orderingProviderState
      orderingProviderZipCode: $orderingProviderZipCode
      orderingProviderPhone: $orderingProviderPhone
      deviceTypes: $devices
      defaultDevice: $defaultDevice
    )
  }
`;

const Settings = () => {
  const {
    data: settings,
    loading: isLoadingSettings,
    error: errorFetchingSettings,
    refetch: refetchSettings,
  } = useQuery(GET_SETTINGS_QUERY);

  const [setSettings] = useMutation(SET_SETTINGS_MUTATION);

  const [deviceSettings, updateDeviceSettings] = useState({});
  const [orgSettings, updateOrgSettings] = useState({});
  const [formChanged, updateFormChanged] = useState(false);

  const updateDeviceSettingsHandler = (data) => {
    updateDeviceSettings(data);
    updateFormChanged(true);
  };

  const updateOrgSettingsHandler = (data) => {
    updateOrgSettings(data);
    updateFormChanged(true);
  };

  useEffect(() => {
    if (settings) {
      let supportedDevices = settings.organization.deviceTypes.reduce(
        (acc, device) => {
          let name = `device-${uuidv4()}`;
          acc[name] = device.internalId;
          return acc;
        },
        {}
      );

      let deviceSettings = {
        supportedDevices: supportedDevices,
        defaultDeviceId: settings.organization.defaultDeviceType
          ? settings.organization.defaultDeviceType.internalId
          : null,
      };
      updateDeviceSettings(deviceSettings);
      updateOrgSettings(settings.organization);
    }
  }, [settings]);

  const onSaveSettings = () => {
    setSettings({
      variables: {
        testingFacilityName: orgSettings.testingFacilityName,
        cliaNumber: orgSettings.cliaNumber,
        orderingProviderFirstName: orgSettings.orderingProviderFirstName,
        orderingProviderLastName: orgSettings.orderingProviderLastName,
        orderingProviderNPI: orgSettings.orderingProviderNPI,
        orderingProviderStreet: orgSettings.orderingProviderStreet,
        orderingProviderStreetTwo: orgSettings.orderingProviderStreetTwo,
        orderingProviderCity: orgSettings.orderingProviderCity,
        orderingProviderCounty: orgSettings.orderingProviderCounty,
        orderingProviderState: orgSettings.orderingProviderState,
        orderingProviderZipCode: orgSettings.orderingProviderZipCode,
        orderingProviderPhone: orgSettings.orderingProviderPhone,
        devices: Object.values(deviceSettings.supportedDevices),
        defaultDevice: deviceSettings.defaultDeviceId,
      },
    }).then((d) => {
      console.log("success!", d); // TODO: should return an id
      let alert = (
        <Alert
          type={"success"}
          title={"Updated Organization"}
          body={"The settings for the organization has been updated"}
        />
      );
      showNotification(toast, alert);
      refetchSettings(); // this does nothing
    });
  };

  if (isLoadingSettings) {
    return <p> Loading... </p>;
  }
  if (errorFetchingSettings) {
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
            disabled={!formChanged}
          />
        </div>
      </div>
      <OrganizationSettings
        orgSettings={orgSettings}
        updateOrgSettings={updateOrgSettingsHandler}
      />
      <OrderingProviderSettings
        orgSettings={orgSettings}
        updateOrgSettings={updateOrgSettingsHandler}
      />
      <DeviceSettings
        deviceSettings={deviceSettings}
        updateDeviceSettings={updateDeviceSettingsHandler}
      />
    </main>
  );
};

export default Settings;
