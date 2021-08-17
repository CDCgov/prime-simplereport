import { useSelector } from "react-redux";

import { RootState } from "../store";
import { getFacilityIdFromUrl } from "../utils/url";

export const useSelectedFacility = () => {
  const facility = getFacilityIdFromUrl();
  const selectedFacility = useSelector<RootState, Facility | undefined>(
    (state) => state.facilities.find((f) => f.id === facility)
  );

  const setSelectedFacility = (facility: Facility) => {
    window.location.href = `${
      window.location.pathname
    }?facility=${encodeURIComponent(facility.id)}`;
  };

  return [selectedFacility, setSelectedFacility] as const;
};
