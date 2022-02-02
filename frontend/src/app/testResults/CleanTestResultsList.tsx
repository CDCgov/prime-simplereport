// this component removes all filter search params from the url
import qs from "querystring";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useSelectedFacility } from "../facilitySelect/useSelectedFacility";

const CleanTestResultsList = () => {
  const navigate = useNavigate();
  const [facility] = useSelectedFacility();
  const activeFacilityId = facility?.id || "";

  useEffect(() => {
    if (activeFacilityId && navigate) {
      navigate({
        pathname: "/results/1",
        search: qs.stringify({
          facility: activeFacilityId,
        }),
      });
    }
  }, [activeFacilityId, navigate]);

  return <></>;
};

export default CleanTestResultsList;
