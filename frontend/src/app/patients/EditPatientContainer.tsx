import { useReactiveVar } from "@apollo/client";
import React from "react";

import { facilities } from "../../storage/store";

import EditPatient from "./EditPatient";

interface Props {
  patientId: string;
}

const EditPatientContainer: React.FC<Props> = ({ patientId }) => {
  const { current } = useReactiveVar(facilities);
  const activeFacilityId: string | undefined = current?.id;

  if (!activeFacilityId) {
    return <div>No facility selected</div>;
  }
  return <EditPatient facilityId={activeFacilityId} patientId={patientId} />;
};

export default EditPatientContainer;
