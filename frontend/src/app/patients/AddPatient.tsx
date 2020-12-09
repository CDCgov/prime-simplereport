import React from "react";
import { useSelector } from "react-redux";

import PatientForm from "./PatientForm";

const AddPatient = () => {
  const activeFacilityId = useSelector(
    (state) => (state as any).facility.id as string
  );
  if (activeFacilityId.length < 1) {
    return <div>"No facility selected"</div>;
  }
  return <PatientForm patient={{ id: "" }} activeFacilityId={activeFacilityId} />;
};

export default AddPatient;


