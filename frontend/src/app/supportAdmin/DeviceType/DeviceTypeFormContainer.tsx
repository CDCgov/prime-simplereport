import { useEffect, useState } from "react";
import { Redirect } from "react-router-dom";

import {
  useCreateDeviceTypeMutation,
  useGetSpecimenTypesQuery,
} from "../../../generated/graphql";
import Alert from "../../commonComponents/Alert";
import { showNotification } from "../../utils";
import { MultiSelectDropdownOption } from "../../commonComponents/MultiSelect/MultiSelectDropdown/MultiSelectDropdown";
import { LoadingCard } from "../../commonComponents/LoadingCard/LoadingCard";

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
  const [swabOptions, setSwabOptions] = useState<MultiSelectDropdownOption[]>(
    []
  );

  const [createDeviceType] = useCreateDeviceTypeMutation();
  const { data: specimenTypesResults } = useGetSpecimenTypesQuery({
    fetchPolicy: "no-cache",
  });

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
    return <Redirect to="/admin" />;
  }

  if (!specimenTypesResults && swabOptions.length === 0) {
    return <LoadingCard message="Loading" />;
  } else {
    return (
      <DeviceTypeForm
        saveDeviceType={saveDeviceType}
        swabOptions={swabOptions}
      />
    );
  }
};

export default DeviceTypeFormContainer;
