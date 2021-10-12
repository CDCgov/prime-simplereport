import { useEffect, useState } from "react";
import { Redirect } from "react-router-dom";

import {
  UpdateDeviceType,
  useGetDeviceTypeListQuery,
  useGetSpecimenTypesQuery,
  useUpdateDeviceTypeMutation,
  DeviceType,
} from "../../../generated/graphql";
import { MultiSelectDropdownOption } from "../../commonComponents/MultiSelect/MultiSelectDropdown/MultiSelectDropdown";
import { LoadingCard } from "../../commonComponents/LoadingCard/LoadingCard";
import { showNotification } from "../../utils";
import Alert from "../../commonComponents/Alert";

import ManageDevicesForm from "./ManageDevicesForm";

const DeviceTypeFormContainer = () => {
  const [submitted, setSubmitted] = useState(false);
  const [swabOptions, setSwabOptions] = useState<MultiSelectDropdownOption[]>(
    []
  );

  const [devices, setDevices] = useState<DeviceType[]>([]);

  const [updateDeviceType] = useUpdateDeviceTypeMutation();
  const { data: specimenTypesResults } = useGetSpecimenTypesQuery({
    fetchPolicy: "no-cache",
  });
  const { data: deviceTypeResults } = useGetDeviceTypeListQuery({
    fetchPolicy: "no-cache",
  });

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

  const saveDeviceType = (device: UpdateDeviceType) => {
    console.log(device);
    updateDeviceType({
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
        updateDeviceType={saveDeviceType}
        swabOptions={swabOptions}
        devices={devices}
      />
    );
  }
};

export default DeviceTypeFormContainer;
