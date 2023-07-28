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
import { showError, showSuccess } from "../../utils/srToast";
import { useSelectedFacility } from "../../facilitySelect/useSelectedFacility";
import { useDocumentTitle } from "../../utils/hooks";
import { editDevicePageTitle } from "../pageTitles";

import DeviceForm from "./DeviceForm";

const ManageDeviceTypeFormContainer = () => {
  useDocumentTitle(editDevicePageTitle);

  const [submitted, setSubmitted] = useState(false);
  const [activeFacility] = useSelectedFacility();
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

  const updateDevice = (device: UpdateDeviceType) => {
    if (device.testLength <= 0 || device.testLength > 999) {
      showError(
        "Failed to update device. Invalid test length",
        "Update device failed"
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
          showSuccess("The device has been updated", "Updated device");
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
    return <Navigate to={`/admin?facility=${activeFacility?.id}`} />;
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
        formTitle={editDevicePageTitle}
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
