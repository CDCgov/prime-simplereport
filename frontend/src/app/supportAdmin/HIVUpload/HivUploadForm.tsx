import { FormGroup } from "@trussworks/react-uswds";
import React, { useState } from "react";

import Button from "../../commonComponents/Button/Button";
import SingleFileInput from "../../commonComponents/SingleFileInput";
import { useDocumentTitle } from "../../utils/hooks";
import { showError } from "../../utils/srToast";
import { FileUploadService } from "../../../fileUploadService/FileUploadService";

export const HivUploadForm = () => {
  useDocumentTitle("Upload HIV CSV");

  const [buttonIsDisabled, setButtonIsDisabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File>();
  const [response, setResponse] = useState<any>();
  const [fileInputResetValue, setFileInputResetValue] = useState(0);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setButtonIsDisabled(true);
    setFile(undefined);

    try {
      if (!event?.currentTarget?.files?.length) {
        return; //no files
      }
      const currentFile = event.currentTarget.files.item(0);
      if (!currentFile) {
        return;
      }
      setFile(currentFile);
      setButtonIsDisabled(false);
    } catch (err: any) {
      showError(err.toString(), "An unexpected error happened");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setButtonIsDisabled(true);
    if (!file) {
      setIsSubmitting(false);
      setResponse({ error: "Empty file" });
      setFileInputResetValue(fileInputResetValue + 1);
      return;
    }

    FileUploadService.uploadHIVResults(file).then(async (res) => {
      setFileInputResetValue(fileInputResetValue + 1);
      setIsSubmitting(false);
      setFile(undefined);
      const response = await res.json();
      setResponse(response);
    });
  };

  return (
    <div className="prime-home flex-1">
      <div className="grid-container">
        <div className="grid-row">
          <div className="prime-container card-container">
            <div className="usa-card__header">
              <h1>Upload HIV CSV</h1>
            </div>
            <div className="usa-card__body padding-y-2 maxw-prose">
              <FormGroup className="margin-bottom-3">
                <SingleFileInput
                  key={fileInputResetValue}
                  id="upload-csv-input"
                  name="upload-csv-input"
                  ariaLabel="Choose CSV file"
                  accept="text/csv, .csv"
                  onChange={(e) => handleFileChange(e)}
                  required
                />
              </FormGroup>
              <Button
                type="submit"
                onClick={(e) => handleSubmit(e)}
                disabled={buttonIsDisabled || file?.name?.length === 0}
              >
                {isSubmitting && (
                  <span>
                    <span>Processing file...</span>
                  </span>
                )}
                {!isSubmitting && <span>Upload your CSV</span>}
              </Button>
              <pre>{JSON.stringify(response, null, 2)}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
