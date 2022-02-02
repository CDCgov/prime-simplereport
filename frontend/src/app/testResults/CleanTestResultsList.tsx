// this component removes all filter search params from the url
import qs from "querystring";

import { useHistory } from "react-router-dom";
import React from "react";

import { useSelectedFacility } from "../facilitySelect/useSelectedFacility";

const CleanTestResultsList = () => {
  const history = useHistory();
  const [facility] = useSelectedFacility();
  const activeFacilityId = facility?.id || "";

  if (activeFacilityId && history) {
    history.push({
      pathname: "/results/1",
      search: qs.stringify({
        facility: activeFacilityId,
      }),
    });
  }

  return <></>;
};

export default CleanTestResultsList;
