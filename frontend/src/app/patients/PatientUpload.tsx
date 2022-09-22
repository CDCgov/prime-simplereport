import React from "react";

import { showError, showNotification } from "../utils";
import Alert from "../commonComponents/Alert";
import { FileUploadService } from "../../fileUploadService/FileUploadService";

interface Props {
  onSuccess: () => void;
}

const PatientUpload = ({ onSuccess }: Props) => {
  const bulkUpload = async ({
    target: { files },
  }: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = files;

    if (fileList === null) {
      showError("Error", "File not found");
      return;
    }

    FileUploadService.uploadPatients(fileList[0]).then(async (response) => {
      const successful = response.status === 200;
      showNotification(
        <Alert
          type={successful ? "success" : "error"}
          title={successful ? "Patients uploaded" : "error"}
          body={await response.text()}
        />
      );
      successful && onSuccess();
    });
  };

  return (
    <input
      type="file"
      name="file"
      placeholder="UploadCSV..."
      data-testid="patient-file-input"
      onChange={bulkUpload}
    />
  );
};

export default PatientUpload;
