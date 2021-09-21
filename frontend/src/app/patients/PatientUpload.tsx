import React from "react";
import { gql, useMutation } from "@apollo/client";

import { showError, showNotification } from "../utils";
import Alert from "../commonComponents/Alert";

const uploadPatients = gql`
  mutation UploadPatients($patientList: Upload!) {
    uploadPatients(patientList: $patientList)
  }
`;

interface Props {
  onSuccess: () => void;
}

const PatientUpload = ({ onSuccess }: Props) => {
  const [upload] = useMutation(uploadPatients);

  const bulkUpload = async ({
    target: { files },
  }: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = files;
    if (fileList === null) {
      showError("Error", "File not found");
      return;
    }
    upload({ variables: { patientList: fileList[0] } }).then((response) => {
      showNotification(
        <Alert
          type="success"
          title={`Patients uploaded`}
          body={response.data.uploadPatients}
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
