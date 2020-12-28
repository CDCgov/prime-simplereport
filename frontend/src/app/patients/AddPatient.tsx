import React from "react";
import { useSelector } from "react-redux";

import PatientForm from "./PatientForm";

const AddPatient = () => {
  const activeFacilityId: string = useSelector(
    (state) => (state as any).facility.id
  );
  if (activeFacilityId.length < 1) {
    return <div>"No facility selected"</div>;
  }
  return (
    <PatientForm
      patient={{ patientId: "" }}
      activeFacilityId={activeFacilityId}
    />
  );
};

export default AddPatient;
