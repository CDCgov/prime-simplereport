import { useEffect, useState } from "react";
import { Redirect } from "react-router-dom";

import {
  useCreateDeviceTypeNewMutation,
  useGetDeviceTypeListQuery,
  useGetSpecimenTypesQuery,
} from "../../../generated/graphql";
import Alert from "../../commonComponents/Alert";
import { showNotification } from "../../utils";
import { MultiSelectDropdownOption } from "../../commonComponents/MultiSelect/MultiSelectDropdown/MultiSelectDropdown";
import { LoadingCard } from "../../commonComponents/LoadingCard/LoadingCard";

import ManageDevicesForm from "./ManageDevicesForm";
import { DeviceType } from "./types";

const DeviceTypeFormContainer = () => {
  const [submitted, setSubmitted] = useState(false);
  const [swabOptions, setSwabOptions] = useState<MultiSelectDropdownOption[]>(
    []
  );

  const [devices, setDevices] = useState<DeviceType[]>([]);

  const [createDeviceType] = useCreateDeviceTypeNewMutation();
  const { data: specimenTypesResults } = useGetSpecimenTypesQuery();
  const { data: deviceTypeResults } = useGetDeviceTypeListQuery();

  useEffect(() => {
    if (deviceTypeResults && deviceTypeResults.deviceTypes) {
      setDevices(
        Array.from(
          deviceTypeResults.deviceTypes.map(
            (devicesTypes) => devicesTypes as DeviceType
          )
        )
      );
    }
  }, [deviceTypeResults]);

  useEffect(() => {
    if (
      specimenTypesResults &&
      specimenTypesResults.specimenTypes &&
      swabOptions.length === 0
    ) {
      setSwabOptions(
        Array.from(
          specimenTypesResults.specimenTypes.map((type) => ({
            label: `${type?.name} (${type?.typeCode})`,
            value: type?.internalId,
          }))
        )
      );
    }
  }, [specimenTypesResults, swabOptions]);

  const saveDeviceType = (device: DeviceType) => {
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

  if (!deviceTypeResults || !specimenTypesResults) {
    return <LoadingCard message="Loading" />;
  } else {
    return (
      <ManageDevicesForm
        saveDeviceType={saveDeviceType}
        swabOptions={swabOptions}
        devices={devices}
      />
    );
  }
};

export default DeviceTypeFormContainer;
