import { ReactiveVar } from "@apollo/client";

// TODO: Setup list of facilities, current selected facility.

export const useFacilities = (facilitiesVar: ReactiveVar<FacilitiesState>) => {
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
    setCurrentFacility,
    setInitFacilities,
  };
};
