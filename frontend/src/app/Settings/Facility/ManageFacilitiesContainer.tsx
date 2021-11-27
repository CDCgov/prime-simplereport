import { useGetManagedFacilitiesQuery } from "../../../generated/graphql";

import ManageFacilities from "./ManageFacilities";

const ManageFacilitiesContainer: any = () => {
  const { data, loading, error } = useGetManagedFacilitiesQuery({
    fetchPolicy: "no-cache",
  });
  const settingsData = data as SettingsData;

  if (loading) {
    return <p> Loading... </p>;
  }
  if (error) {
    return error;
  }
  if (!settingsData || !settingsData.organization) {
    return <p>Error: facilities not found</p>;
  }

  const facilities: Facility[] = settingsData.organization.testingFacility.map(
    (f) => {
      return {
        ...f,
        defaultDevice: f.defaultDeviceType
          ? f.defaultDeviceType.internalId
          : "",
        deviceTypes: Object.values(f.deviceTypes).map((d) => d.internalId),
      };
    }
  );
  return <ManageFacilities facilities={facilities} />;
};

export default ManageFacilitiesContainer;
