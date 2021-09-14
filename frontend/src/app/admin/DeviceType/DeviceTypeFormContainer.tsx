import React, { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { Redirect } from "react-router-dom";

import Alert from "../../commonComponents/Alert";
import { showNotification } from "../../utils";

import DeviceTypeForm from "./DeviceTypeForm";

const CREATE_DEVICE_TYPE_MUTATION = gql`
  mutation createDeviceType(
    $name: String!
    $manufacturer: String!
    $model: String!
    $loincCode: String!
    $swabType: String!
  ) {
    createDeviceType(
      name: $name
      manufacturer: $manufacturer
      model: $model
      loincCode: $loincCode
      swabType: $swabType
    ) {
      internalId
    }
  }
`;

export interface Device {
  name: string;
  manufacturer: string;
  model: string;
  loincCode: string;
  swabType: string;
}

const DeviceTypeFormContainer: any = () => {
  const [submitted, setSubmitted] = useState(false);
  const [createDeviceType] = useMutation(CREATE_DEVICE_TYPE_MUTATION);

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
