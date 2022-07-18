import { useState } from "react";
import { Navigate } from "react-router-dom";

import {
  DeviceType,
  UpdateDeviceType,
  useGetDeviceTypeListQuery,
  useGetSpecimenTypesQuery,
  useGetSupportedDiseasesQuery,
  useUpdateDeviceTypeMutation,
} from "../../../generated/graphql";
import { LoadingCard } from "../../commonComponents/LoadingCard/LoadingCard";
import { showNotification } from "../../utils";
import Alert from "../../commonComponents/Alert";

import { Device } from "./DeviceTypeFormContainer";
import DeviceForm from "./DeviceForm";

const ManageDeviceTypeFormContainer = () => {
  const [submitted, setSubmitted] = useState(false);
  const [updateDeviceType] = useUpdateDeviceTypeMutation();
  const { data: specimenTypesResults } = useGetSpecimenTypesQuery({
    fetchPolicy: "no-cache",
  });
  const { data: deviceTypeResults } = useGetDeviceTypeListQuery({
    fetchPolicy: "no-cache",
  });
  const { data: supportedDiseaseResults } = useGetSupportedDiseasesQuery({
    fetchPolicy: "no-cache",
  });

  const saveDevice = (device: Device) => {
    if (device.internalId) {
      const variables: UpdateDeviceType = {
        internalId: device.internalId,
        name: device.name,
        manufacturer: device.manufacturer,
        model: device.model,
        swabTypes: device.swabTypes,
        supportedDiseases: device.supportedDiseases,
        loincCode: device.loincCode,
        testLength: device.testLength,
      };
      updateDeviceType({
        variables,
        fetchPolicy: "no-cache",
      }).then(() => {
        const alert = (
          <Alert
            type="success"
            title="Updated Device"
            body="The device has been updated"
          />
        );
        showNotification(alert);
        setSubmitted(true);
      });
    } else {
      //todo: make this better
      console.log(
        "internal id for saving a device is undefined and your code is bad; aborting"
      );
    }
  };

  if (submitted) {
    return <Navigate to="/admin" />;
  }

  if (deviceTypeResults && specimenTypesResults && supportedDiseaseResults) {
    const swabOptions = Array.from(
      specimenTypesResults.specimenTypes.map((type) => ({
        label: `${type?.name} (${type?.typeCode})`,
        value: type?.internalId,
      }))
    );

    const supportedDiseaseOptions = Array.from(
      supportedDiseaseResults.supportedDiseases.map((disease) => ({
        label: disease.name,
        value: disease.internalId,
      }))
    );

    const devices = Array.from(
      deviceTypeResults.deviceTypes.map(
        (devicesTypes) => devicesTypes as DeviceType
      )
    );

    return (
      <DeviceForm
        formTitle="Manage devices"
        saveDeviceType={saveDevice}
        swabOptions={swabOptions}
        supportedDiseaseOptions={supportedDiseaseOptions}
        deviceOptions={devices}
      />
    );
  } else {
    return <LoadingCard message="Loading" />;
  }
};

export default ManageDeviceTypeFormContainer;
