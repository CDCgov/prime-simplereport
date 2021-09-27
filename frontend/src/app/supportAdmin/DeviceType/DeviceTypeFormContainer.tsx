import { useState } from "react";
import { Redirect } from "react-router-dom";

import { useCreateDeviceTypeMutation } from "../../../generated/graphql";
import Alert from "../../commonComponents/Alert";
import { showNotification } from "../../utils";

import DeviceTypeForm from "./DeviceTypeForm";

export interface Device {
  name: string;
  manufacturer: string;
  model: string;
  loincCode: string;
  swabType: string;
}

const DeviceTypeFormContainer = () => {
  const [submitted, setSubmitted] = useState(false);
  const [createDeviceType] = useCreateDeviceTypeMutation();

  const saveDeviceType = (device: Device) => {
    createDeviceType({
      variables: device,
    }).then(() => {
      let alert = (
        <Alert
          type="success"
          title="Created Device"
          body="The device has been created"
        />
      );
      showNotification(alert);
      setSubmitted(true);
    });
  };

  if (submitted) {
    return <Redirect to="/admin" />;
  }

  return <DeviceTypeForm saveDeviceType={saveDeviceType} />;
};

export default DeviceTypeFormContainer;
