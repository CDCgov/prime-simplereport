import {
  DeviceType,
  useGetDeviceTypesForLookupQuery,
} from "../../../generated/graphql";
import { LoadingCard } from "../../commonComponents/LoadingCard/LoadingCard";

import DeviceLookup from "./DeviceLookup";

const DeviceLookupContainer = () => {
  const { data: deviceTypeResults } = useGetDeviceTypesForLookupQuery({
    fetchPolicy: "no-cache",
  });

  if (deviceTypeResults) {
    const devices = Array.from(
      deviceTypeResults.deviceTypes.map(
        (devicesTypes) => devicesTypes as DeviceType
      )
    );

    return <DeviceLookup deviceOptions={devices} />;
  } else {
    return <LoadingCard message="Loading" />;
  }
};

export default DeviceLookupContainer;
