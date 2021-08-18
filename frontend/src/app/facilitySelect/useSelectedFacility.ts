import { useSelector } from "react-redux";
import { useHistory } from "react-router";

import { RootState } from "../store";
import { getFacilityIdFromUrl } from "../utils/url";

export const useSelectedFacility = () => {
  const history = useHistory();
  const facility = getFacilityIdFromUrl();
  const selectedFacility = useSelector<RootState, Facility | undefined>(
    (state) => state.facilities.find((f) => f.id === facility)
  );

  const setSelectedFacility = (selected: Facility) => {
    if (facility) {
      window.location.href = `${
        window.location.pathname
      }?facility=${encodeURIComponent(selected.id)}`;
    } else {
      history.push({ search: `?facility=${encodeURIComponent(selected.id)}` });
    }
  };

  return [selectedFacility, setSelectedFacility] as const;
};
