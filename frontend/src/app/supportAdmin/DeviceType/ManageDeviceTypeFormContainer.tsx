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

import DeviceForm, { Device } from "./DeviceForm";

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

  const updateDevice = (device: Device) => {
    if (device.testLength <= 0 || device.testLength > 999) {
      showNotification(
        <Alert
          type="error"
          title="Update device failed"
          body="Failed to update device. Invalid test length"
        />
      );
    } else {
      if (device.internalId) {
        const variables: UpdateDeviceType = {
          ...device,
          internalId: device.internalId,
        };
        updateDeviceType({
          variables,
          fetchPolicy: "no-cache",
        }).then(() => {
          const alert = (
            <Alert
              type="success"
              title="Updated device"
              body="The device has been updated"
            />
          );
          showNotification(alert);
          setSubmitted(true);
        });
      } else {
        console.log(
          "Invalid attempt to update a device with no internal ID; aborting"
        );
      }
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
        saveDeviceType={updateDevice}
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
