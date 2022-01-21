import { useParams } from "react-router-dom";

import { useSelectedFacility } from "../facilitySelect/useSelectedFacility";

import EditPatient from "./EditPatient";

const EditPatientContainer = () => {
  const [facility] = useSelectedFacility();
  const activeFacilityId = facility?.id;
  const params = useParams();
  const patientId = params.patientId || "";

  if (!activeFacilityId) {
    return <div>"No facility selected"</div>;
  }

  if (!patientId) {
    return <div>No patient selected</div>;
  }

  return <EditPatient facilityId={activeFacilityId} patientId={patientId} />;
};

export default EditPatientContainer;
