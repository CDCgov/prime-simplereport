import {
  DeviceType,
  useGetSpecimenTypesQuery,
  useGetDeviceTypeListQuery,
} from "../../../generated/graphql";
import { LoadingCard } from "../../commonComponents/LoadingCard/LoadingCard";

import DeviceLookup from "./DeviceLookup";

const DeviceLookupContainer = () => {
  const { data: specimenTypesResults } = useGetSpecimenTypesQuery({
    fetchPolicy: "no-cache",
  });

  const { data: deviceTypeResults } = useGetDeviceTypeListQuery({
    fetchPolicy: "no-cache",
  });

  if (deviceTypeResults && specimenTypesResults) {
    const swabOptions = Array.from(
      specimenTypesResults.specimenTypes.map((type) => ({
        swabName: type?.name,
        typeCode: type?.typeCode,
        internalId: type?.internalId,
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
        deviceOptions={devices}
      />
    );
  } else {
    return <LoadingCard message="Loading" />;
  }
};

export default DeviceLookupContainer;
