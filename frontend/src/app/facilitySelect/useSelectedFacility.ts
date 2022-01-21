import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

import { RootState } from "../store";

export function useSelectedFacility() {
  const navigate = useNavigate();
  const facilityId = useQuery().get("facility");

  const selectedFacility = useSelector<RootState, Facility | undefined>(
    (state) => state.facilities.find((f) => f.id === facilityId)
  );

  const setSelectedFacility = (selected: Facility) => {
    navigate({ search: `?facility=${encodeURIComponent(selected.id)}` });
  };

  return [selectedFacility, setSelectedFacility] as const;
}

function useQuery() {
  return new URLSearchParams(useLocation().search);
}
