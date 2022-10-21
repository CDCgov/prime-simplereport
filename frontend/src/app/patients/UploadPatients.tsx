import React from "react";

import { useDocumentTitle } from "../utils/hooks";

import PatientsNav from "./PatientsNav";

const UploadPatients = () => {
  useDocumentTitle("Add Patient");

  return (
    <div className="grid-row header-size-fix">
      <div className="prime-container card-container">
        <PatientsNav />
        <div className="usa-card__header">
          <h1>Upload your results</h1>
        </div>
      </div>
    </div>
  );
};

export default UploadPatients;
