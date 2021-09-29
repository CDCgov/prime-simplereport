import { useEffect, useState } from "react";
import { Redirect } from "react-router-dom";

import {
  useCreateDeviceTypeNewMutation,
  useGetSpecimenTypesQuery,
} from "../../../generated/graphql";
import Alert from "../../commonComponents/Alert";
import { showNotification } from "../../utils";
import { ComboBoxOption } from "../../commonComponents/MultiSelect/ComboBox/ComboBox";

import DeviceTypeForm from "./DeviceTypeForm";

export interface Device {
  name: string;
  manufacturer: string;
  model: string;
  loincCode: string;
  swabTypes: Array<string>;
}

const DeviceTypeFormContainer = () => {
  const [submitted, setSubmitted] = useState(false);
  const [swabOptions, setSwabOptions] = useState<Array<ComboBoxOption>>([]);

  const [createDeviceType] = useCreateDeviceTypeNewMutation();
  const { data } = useGetSpecimenTypesQuery();

  useEffect(() => {
    if (data && data.specimenTypes && swabOptions.length === 0) {
      setSwabOptions(
        Array.from(
          data.specimenTypes.map((type) => ({
            label: `${type?.name} (${type?.typeCode})`,
            value: type?.internalId,
          }))
        )
      );
    }
  }, [data, swabOptions]);

  const saveDeviceType = (device: Device) => {
    createDeviceType({
      variables: device,
      fetchPolicy: "no-cache",
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

  return (
    <DeviceTypeForm saveDeviceType={saveDeviceType} swabOptions={swabOptions} />
  );
};

export default DeviceTypeFormContainer;
