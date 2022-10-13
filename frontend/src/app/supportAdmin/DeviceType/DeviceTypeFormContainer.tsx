import { useState } from "react";
import { Navigate } from "react-router-dom";

import {
  useCreateDeviceTypeMutation,
  useGetSpecimenTypesQuery,
  useGetSupportedDiseasesQuery,
} from "../../../generated/graphql";
import { showError, showSuccess } from "../../utils/srToast";
import { LoadingCard } from "../../commonComponents/LoadingCard/LoadingCard";
import { useSelectedFacility } from "../../facilitySelect/useSelectedFacility";

import DeviceForm, { Device } from "./DeviceForm";

const DeviceTypeFormContainer = () => {
  const [submitted, setSubmitted] = useState(false);
  const [activeFacility] = useSelectedFacility();
  const [createDeviceType] = useCreateDeviceTypeMutation();
  const { data: specimenTypesResults } = useGetSpecimenTypesQuery({
    fetchPolicy: "no-cache",
  });
  const { data: supportedDiseaseResults } = useGetSupportedDiseasesQuery({
    fetchPolicy: "no-cache",
  });

  const saveDeviceType = (device: Device) => {
    if (device.testLength <= 0 || device.testLength > 999) {
      showError(
        "Failed to create device. Invalid test length",
        "Create device failed"
      );
    } else {
      if (!device.internalId) {
        createDeviceType({
          variables: device,
          fetchPolicy: "no-cache",
        }).then(() => {
          showSuccess("The device has been created", "Created Device");
          setSubmitted(true);
        });
      } else {
        console.log(
          "Invalid attempt to create a device with an already defined internal ID; aborting"
        );
      }
    }
  };

  if (submitted) {
    return <Navigate to={`/admin?facility=${activeFacility?.id}`} />;
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
      <DeviceForm
        formTitle="Device type"
        saveDeviceType={saveDeviceType}
        initialDevice={{
          name: "",
          manufacturer: "",
          model: "",
          loincCode: "",
          swabTypes: [],
          supportedDiseases: [],
          testLength: 15,
        }}
        swabOptions={swabOptions}
        supportedDiseaseOptions={supportedDiseaseOptions}
      />
    );
  } else {
    return <LoadingCard message="Loading" />;
  }
};

export default DeviceTypeFormContainer;
