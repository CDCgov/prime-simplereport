import {
  DeviceType,
  useGetSpecimenTypesQuery,
  useGetSupportedDiseasesQuery,
  useGetDeviceTypeListQuery,
} from "../../../generated/graphql";
import { LoadingCard } from "../../commonComponents/LoadingCard/LoadingCard";

import DeviceLookup from "./DeviceLookup";

const DeviceLookupContainer = () => {
  const { data: specimenTypesResults } = useGetSpecimenTypesQuery({
    fetchPolicy: "no-cache",
  });
  const { data: supportedDiseaseResults } = useGetSupportedDiseasesQuery({
    fetchPolicy: "no-cache",
  });
  const { data: deviceTypeResults } = useGetDeviceTypeListQuery({
    fetchPolicy: "no-cache",
  });

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
      <DeviceLookup
        formTitle="Device lookup"
        swabOptions={swabOptions}
        supportedDiseaseOptions={supportedDiseaseOptions}
        deviceOptions={devices}
      />
    );
  } else {
    return <LoadingCard message="Loading" />;
  }
};

export default DeviceLookupContainer;
