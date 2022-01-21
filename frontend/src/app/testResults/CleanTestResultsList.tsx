// this component removes all filter search params from the url
import qs from "querystring";

import { useNavigate } from "react-router-dom";

import { useSelectedFacility } from "../facilitySelect/useSelectedFacility";

const CleanTestResultsList = () => {
  const navigate = useNavigate();
  const [facility] = useSelectedFacility();
  const activeFacilityId = facility?.id || "";

  if (activeFacilityId && navigate) {
    navigate({
      pathname: "/results/1",
      search: qs.stringify({
        facility: activeFacilityId,
      }),
    });
  }

  return <></>;
};

export default CleanTestResultsList;
