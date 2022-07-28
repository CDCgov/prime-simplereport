import { useLocation, useParams } from "react-router-dom";

import { useSelectedFacility } from "../facilitySelect/useSelectedFacility";
import { getParameterFromUrl } from "../utils/url";

import EditPatient from "./EditPatient";

const EditPatientContainer = () => {
  const [facility] = useSelectedFacility();
  const activeFacilityId = facility?.id;
  const params = useParams();
  const patientId = params.patientId || "";
  const fromQueue = getParameterFromUrl("fromQueue", useLocation()) === "true";

  if (!activeFacilityId) {
    return <div>"No facility selected"</div>;
  }

  if (!patientId) {
    return <div>No patient selected</div>;
  }

  return (
    <EditPatient
      facilityId={activeFacilityId}
      patientId={patientId}
      fromQueue={fromQueue}
    />
  );
};

export default EditPatientContainer;
