import { gql, useMutation } from "@apollo/client";
import React, { useState } from "react";
import {
  Button,
  Form,
  FormGroup,
  Label,
  FileInput,
} from "@trussworks/react-uswds";

import { showError } from "../../utils";

const UPLOAD_TEST_RESULT_CSV = gql`
  mutation UploadTestResultCSV($testResultList: Upload!) {
    uploadTestResultCSV(testResultList: $testResultList) {
      reportId
      status
      recordsCount
      warnings {
        scope
        message
      }
      errors {
        scope
        message
      }
    }
  }
`;

const PAYLOAD_MAX_BYTES = 50 * 1000 * 1000;
const REPORT_MAX_ITEMS = 10000;
const REPORT_MAX_ITEM_COLUMNS = 2000;

const Uploads = () => {
  const [fileInputResetValue, setFileInputResetValue] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File>();

  const [reportId, setReportId] = useState(null);

  const [errors, setErrors] = useState([]);
  const [errorMessageText, setErrorMessageText] = useState(
    `Please resolve the errors below and upload your edited file. Your file has not been accepted.`
  );

  const [uploadTestResultCSV] = useMutation(UPLOAD_TEST_RESULT_CSV);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      if (!event?.currentTarget?.files?.length) {
        return; //no files
      }
      const file = event.currentTarget.files.item(0);
      if (!file) return;

      if (file.size > PAYLOAD_MAX_BYTES) {
        const maxKBytes = (PAYLOAD_MAX_BYTES / 1024).toLocaleString("en-US", {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
        });
        showError(
          `The file '${file.name}' is too large.  The maximum file size is ${maxKBytes}k`
        );
        return;
      }

      const fileText = await file.text();
      const lineCount = (fileText.match(/\n/g) || []).length + 1;
      if (lineCount > REPORT_MAX_ITEMS) {
        showError(
          `The file '${file.name}' has too many rows. The maximum number of rows is ${REPORT_MAX_ITEMS}.`
        );
        return;
      }

      if (lineCount <= 1) {
        showError(
          `The file '${file.name}' doesn't contain any valid data. File should have a header line and at least one line of data.`
        );
        return;
      }

      // get the first line and examine it
      const firstLine = (fileText.match(/^(.*)\n/) || [""])[0];
      // ideally, the columns would be comma seperated, but they may be tabs, because the first
      // line is a header, we don't have to worry about escaped delimiters in strings (e.g. ,"Smith, John",)
      const columnCount =
        (firstLine.match(/,/g) || []).length ||
        (firstLine.match(/\t/g) || []).length;

      if (columnCount > REPORT_MAX_ITEM_COLUMNS) {
        showError(
          `The file '${file.name}' has too many columns. The maximum number of allowed columns is ${REPORT_MAX_ITEM_COLUMNS}.`
        );
        return;
      }

      setFile(file);
    } catch (err: any) {
      console.error(err);
      showError(`An unexpected error happened: '${err.toString()}'`);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSubmitting(true);
    setReportId(null);
    setErrors([]);

    if (file?.size === 0) {
      return;
    }

    let queryResponse;
    try {
      queryResponse = await uploadTestResultCSV({
        variables: { testResultList: file },
      });
    } catch (error) {}
    const response = queryResponse?.data.uploadTestResultCSV;

    if (queryResponse?.errors?.length) {
      setErrorMessageText(
        "There was a server error. Your file has not been accepted."
      );
    }
    if (response?.reportId) {
      setReportId(response?.reportId);
      event.currentTarget?.reset();
    }
    if (response?.errors?.length) {
      setErrorMessageText(
        "Please resolve the errors below and upload your edited file. Your file has not been accepted."
      );
    }

    if (response?.errors && response.errors.length > 0) {
      // Add a string to properly display the indices if available.
      response.errors.map(
        (errorMsg: any) =>
          (errorMsg.rowList =
            errorMsg.indices && errorMsg.indices.length > 0
              ? errorMsg.indices.join(", ")
              : "")
      );
      setErrors(response.errors);
    }

    setFileInputResetValue(fileInputResetValue + 1);
    setFile(undefined);
    setIsSubmitting(false);
  };

  return (
    <main className="prime-home">
      <div className="grid-container">
        <div className="grid-row">
          <div className="prime-container">
            <div className="usa-card__header">
              <h2>COVID-19 CSV Uploads</h2>
            </div>
            {reportId && (
              <div>
                <div className="usa-alert usa-alert--success">
                  <div className="usa-alert__body">
                    <h4 className="usa-alert__heading">
                      Success: File Accepted
                    </h4>
                    <p className="usa-alert__text">
                      Your file has been successfully transmitted to the
                      department of health
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-normal text-base margin-bottom-0">
                    Confirmation Code
                  </p>
                  <p className="margin-top-05">{reportId}</p>
                </div>
              </div>
            )}
            {errors.length > 0 && (
              <div>
                <div className="usa-alert usa-alert--error" role="alert">
                  <div className="usa-alert__body">
                    <h4 className="usa-alert__heading">
                      Error: File not accepted
                    </h4>
                    <p className="usa-alert__text">{errorMessageText}</p>
                  </div>
                </div>
                <table className="usa-table usa-table--borderless">
                  <thead>
                    <tr>
                      <th>Requested Edit</th>
                      <th>Areas Containing the Requested Edit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {errors.map((e, i) => {
                      return (
                        <tr key={"error_" + i}>
                          <td>{e["message"]}</td>
                          <td>Row(s): {e["rowList"]}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <Form onSubmit={(e) => handleSubmit(e)}>
              <FormGroup className="margin-bottom-3">
                <Label
                  className="font-sans-xs"
                  id="upload-csv-input-label"
                  htmlFor="upload-csv-input"
                >
                  Upload your COVID-19 lab results as a .csv.
                </Label>
                <FileInput
                  key={fileInputResetValue}
                  id="upload-csv-input"
                  name="upload-csv-input"
                  aria-describedby="upload-csv-input-label"
                  accept="text/csv, .csv"
                  onChange={(e) => handleFileChange(e)}
                  required
                />
              </FormGroup>
              <Button
                type="submit"
                disabled={isSubmitting || file?.name?.length === 0}
              >
                {isSubmitting && (
                  <span>
                    <span>Processing file...</span>
                  </span>
                )}
                {!isSubmitting && <span>Upload</span>}
              </Button>
            </Form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Uploads;
