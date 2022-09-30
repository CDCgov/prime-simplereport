import React, { useState } from "react";
import Modal from "react-modal";

import { showError, showNotification } from "../utils";
import { FileUploadService } from "../../fileUploadService/FileUploadService";
import Alert from "../commonComponents/Alert";
import { useSelectedFacility } from "../facilitySelect/useSelectedFacility";
import Checkboxes from "../commonComponents/Checkboxes";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const PatientUploadModal: React.FC<Props> = ({ onClose, onSuccess }) => {
  const [activeFacility] = useSelectedFacility();
  const [useSingleFacility, updateUseSingleFacility] = useState(true);
  const bulkUpload = async ({
    target: { files },
  }: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = files;

    if (fileList === null) {
      showError("Error", "File not found");
      return;
    }

    FileUploadService.uploadPatients(fileList[0], activeFacility?.id).then(
      async (response) => {
        const successful = response.status === 200;
        showNotification(
          <Alert
            type={successful ? "success" : "error"}
            title={successful ? "Patients uploaded" : "Error"}
            body={await response.text()}
          />
        );
        successful && onSuccess();
      }
    );
  };

  return (
    <Modal
      isOpen={true}
      style={{
        content: {
          maxHeight: "90vh",
          width: "40em",
          position: "initial",
        },
      }}
      overlayClassName="prime-modal-overlay display-flex flex-align-center flex-justify-center"
      contentLabel="Unsaved changes to current user"
      ariaHideApp={process.env.NODE_ENV !== "test"}
      onRequestClose={onClose}
    >
      <Checkboxes
        onChange={(e) => updateUseSingleFacility(e.target.checked)}
        legend="Facility selection"
        legendSrOnly
        name="facility-select"
        boxes={[
          {
            value: "singleFacility",
            label: "Upload patients only to current facility",
            checked: useSingleFacility,
          },
        ]}
      />
      <input
        type="file"
        name="file"
        placeholder="UploadCSV..."
        data-testid="patient-file-input"
        onChange={bulkUpload}
      />
    </Modal>
  );
};

export default PatientUploadModal;
