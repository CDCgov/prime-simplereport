import React, { useState } from "react";

import Button from "../commonComponents/Button/Button";

import PatientUploadModal from "./PatientUploadModal";

interface Props {
  onSuccess: () => void;
}

const PatientUpload = ({ onSuccess }: Props) => {
  const [showPatientUploadModal, updateshowPatientUploadModal] = useState(
    false
  );

  return (
    <div>
      <Button
        variant="outline"
        className="margin-left-auto margin-bottom-1"
        onClick={() => updateshowPatientUploadModal(true)}
        label="Begin patient upload"
      />
      {showPatientUploadModal ? (
        <PatientUploadModal
          onClose={() => updateshowPatientUploadModal(false)}
          onSuccess={onSuccess}
        />
      ) : null}
    </div>
  );
};

export default PatientUpload;
