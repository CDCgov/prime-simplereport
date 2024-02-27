import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

import { RootState } from "../store";
import { getFacilityIdFromUrl } from "../utils/url";

export function useSelectedFacility() {
  const navigate = useNavigate();
  const location = useLocation();
  const facilityId = getFacilityIdFromUrl(location);

  const selectedFacility = useSelector<RootState, Facility | undefined>(
    (state) => state.facilities.find((f: Facility) => f.id === facilityId)
  );

  const setSelectedFacility = (selected: Facility) => {
    navigate({ search: `?facility=${encodeURIComponent(selected.id)}` });
  };

  return [selectedFacility, setSelectedFacility] as const;
}
