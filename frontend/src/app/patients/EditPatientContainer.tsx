import React from "react";

import { useSelectedFacility } from "../facilitySelect/useSelectedFacility";

import EditPatient from "./EditPatient";

interface Props {
  patientId: string;
}

const EditPatientContainer: React.FC<Props> = ({ patientId }) => {
  const [facility] = useSelectedFacility();
  const activeFacilityId = facility!.id;

  if (activeFacilityId.length < 1) {
    return <div>"No facility selected"</div>;
  }
  return <EditPatient facilityId={activeFacilityId} patientId={patientId} />;
};

export default EditPatientContainer;
