import React from "react";

import { useDocumentTitle } from "../utils/hooks";

import { AddPatientHeader } from "./Components/AddPatientsHeader";

const UploadPatients = () => {
  useDocumentTitle("Add Patient");

  return (
    <div className={"prime-edit-patient prime-home"}>
      <div className={"grid-container margin-bottom-4"}>
        <div className="patient__header">
          <AddPatientHeader />
        </div>
      </div>
    </div>
  );
};

export default UploadPatients;
