import { useSelector } from "react-redux";
import { useHistory, useLocation } from "react-router";

import { RootState } from "../store";

export function useSelectedFacility() {
  const history = useHistory();
  const facilityId = useQuery().get("facility");

  const selectedFacility = useSelector<RootState, Facility | undefined>(
    (state) => state.facilities.find((f) => f.id === facilityId)
  );

  const setSelectedFacility = (selected: Facility) => {
    history.push({ search: `?facility=${encodeURIComponent(selected.id)}` });
  };

  return [selectedFacility, setSelectedFacility] as const;
}

function useQuery() {
  return new URLSearchParams(useLocation().search);
}
