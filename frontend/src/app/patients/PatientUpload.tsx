import React, { useState } from "react";

import { showError, showSuccess } from "../utils/srToast";
import { FileUploadService } from "../../fileUploadService/FileUploadService";
import { useSelectedFacility } from "../facilitySelect/useSelectedFacility";
import Checkboxes from "../commonComponents/Checkboxes";

interface Props {
  onSuccess: () => void;
}

const PatientUpload = ({ onSuccess }: Props) => {
  const [activeFacility] = useSelectedFacility();
  const [useSingleFacility, updateUseSingleFacility] = useState(false);

  const bulkUpload = async ({
    target: { files },
  }: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = files;

    if (fileList === null) {
      showError("Error", "File not found");
      return;
    }

    let facilityId = useSingleFacility ? activeFacility?.id : "";

    FileUploadService.uploadPatients(fileList[0], facilityId).then(
      async (response) => {
        const successful = response.status === 200;
        const alertMsg = await response.text();
        if (successful) {
          showSuccess(alertMsg, "Patients uploaded");
        } else {
          showError(alertMsg, "Error");
        }
        successful && onSuccess();
      }
    );
  };

  return (
    <div>
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
    </div>
  );
};

export default PatientUpload;
