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
      showNotification(
        <Alert
          type={response.status === 200 ? "success" : "error"}
          title={response.status === 200 ? "Patients uploaded" : "error"}
          body={await response.text()}
        />
      );
      onSuccess();
    });
  };

  return (
    <input
      type="file"
      name="file"
      placeholder="UploadCSV..."
      onChange={bulkUpload}
    />
  );
};

export default PatientUpload;
