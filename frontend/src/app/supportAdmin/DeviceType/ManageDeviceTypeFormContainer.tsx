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

import ManageDevicesForm from "./ManageDevicesForm";

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

  const saveDeviceType = (device: UpdateDeviceType) => {
    updateDeviceType({
      variables: device,
      fetchPolicy: "no-cache",
    }).then(() => {
      const alert = (
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
      <ManageDevicesForm
        updateDeviceType={saveDeviceType}
        swabOptions={swabOptions}
        supportedDiseaseOptions={supportedDiseaseOptions}
        devices={devices}
      />
    );
  } else {
    return <LoadingCard message="Loading" />;
  }
};

export default ManageDeviceTypeFormContainer;
