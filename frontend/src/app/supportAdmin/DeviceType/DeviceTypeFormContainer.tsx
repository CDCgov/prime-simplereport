import { useState } from "react";
import { Navigate } from "react-router-dom";

import {
  useCreateDeviceTypeMutation,
  useGetSpecimenTypesQuery,
  useGetSupportedDiseasesQuery,
} from "../../../generated/graphql";
import Alert from "../../commonComponents/Alert";
import { showNotification } from "../../utils";
import { LoadingCard } from "../../commonComponents/LoadingCard/LoadingCard";

import DeviceTypeForm from "./DeviceTypeForm";

export interface Device {
  name: string;
  manufacturer: string;
  model: string;
  loincCode: string;
  swabTypes: Array<string>;
  supportedDiseases: Array<string>;
}

const DeviceTypeFormContainer = () => {
  const [submitted, setSubmitted] = useState(false);
  const [createDeviceType] = useCreateDeviceTypeMutation();
  const { data: specimenTypesResults } = useGetSpecimenTypesQuery({
    fetchPolicy: "no-cache",
  });
  const { data: supportedDiseaseResults } = useGetSupportedDiseasesQuery({
    fetchPolicy: "no-cache",
  });

  const saveDeviceType = (device: Device) => {
    createDeviceType({
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

  if (specimenTypesResults && supportedDiseaseResults) {
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
    return (
      <DeviceTypeForm
        saveDeviceType={saveDeviceType}
        swabOptions={swabOptions}
        supportedDiseaseOptions={supportedDiseaseOptions}
      />
    );
  } else {
    return <LoadingCard message="Loading" />;
  }
};

export default DeviceTypeFormContainer;
