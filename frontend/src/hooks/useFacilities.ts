import { useReactiveVar } from "@apollo/client";

import { facilities as facilitiesVar } from "../storage/store";

// TODO: Setup list of facilities, current selected facility.

export const useFacilities = () => {
  const facilities = useReactiveVar(facilitiesVar);

  const setCurrentFacility = (facility: Facility) => {
    facilitiesVar({ ...facilitiesVar(), current: facility });
  };

  const setInitFacilities = (data: Facility[]) => {
    if (data.length) {
      if (data.length === 1) {
        facilitiesVar({ current: null, list: data });
        return;
      }
      facilitiesVar({ current: data[0], list: data });
    }
  };

  return {
    facilities,
    setCurrentFacility,
    setInitFacilities,
  };
};
