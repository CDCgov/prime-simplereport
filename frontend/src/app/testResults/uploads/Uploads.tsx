import React, { useState } from "react";
import { Button, FormGroup, FileInput } from "@trussworks/react-uswds";

import { showError } from "../../utils";
import { FeedbackMessage } from "../../../generated/graphql";
import { useDocumentTitle } from "../../utils/hooks";
import { LinkWithQuery } from "../../commonComponents/LinkWithQuery";
import { FileUploadService } from "../../../fileUploadService/FileUploadService";

const PAYLOAD_MAX_BYTES = 50 * 1000 * 1000;
const REPORT_MAX_ITEMS = 10000;
const REPORT_MAX_ITEM_COLUMNS = 2000;

const Uploads = () => {
  useDocumentTitle("Upload spreadsheet");

  const [fileInputResetValue, setFileInputResetValue] = useState(0);
  const [buttonIsDisabled, setButtonIsDisabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File>();

  const [reportId, setReportId] = useState<string | null>(null);

  const [errors, setErrors] = useState<
    Array<FeedbackMessage | undefined | null>
  >([]);
  const [errorMessageText, setErrorMessageText] = useState(
    `Please resolve the errors below and upload your edited file. Your file has not been accepted.`
  );

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      if (!event?.currentTarget?.files?.length) {
        return; //no files
      }
      const currentFile = event.currentTarget.files.item(0);
      if (!currentFile) {
        return;
      }

      if (currentFile.size > PAYLOAD_MAX_BYTES) {
        const maxKBytes = (PAYLOAD_MAX_BYTES / 1024).toLocaleString("en-US", {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
        });
        showError(
          `The file '${currentFile.name}' is too large.  The maximum file size is ${maxKBytes}k`
        );
        return;
      }

      const fileText = await currentFile.text();
      const lineCount = (fileText.match(/\n/g) || []).length + 1;
      if (lineCount > REPORT_MAX_ITEMS) {
        showError(
          `The file '${currentFile.name}' has too many rows. The maximum number of rows is ${REPORT_MAX_ITEMS}.`
        );
        return;
      }

      if (lineCount <= 1) {
        showError(
          `The file '${currentFile.name}' doesn't contain any valid data. File should have a header line and at least one line of data.`
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
          `The file '${currentFile.name}' has too many columns. The maximum number of allowed columns is ${REPORT_MAX_ITEM_COLUMNS}.`
        );
        return;
      }
      setFile(currentFile);
      setButtonIsDisabled(false);
    } catch (err: any) {
      showError(`An unexpected error happened: '${err.toString()}'`);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLButtonElement>) => {
    event.preventDefault();

    setIsSubmitting(true);
    setButtonIsDisabled(true);
    setReportId(null);
    setErrors([]);

    if (!file || file.size === 0) {
      setButtonIsDisabled(false);
      const errorMessage = {} as FeedbackMessage;
      errorMessage.message = "Invalid File";
      setErrors([errorMessage]);
      return;
    }

    FileUploadService.uploadResults(file).then(async (res) => {
      if (res.status !== 200) {
        setErrorMessageText(
          "There was a server error. Your file has not been accepted."
        );
      } else {
        const response = await res.json();

        if (response?.reportId) {
          setReportId(response?.reportId);
        }

        if (response?.errors?.length) {
          setErrorMessageText(
            "Please resolve the errors below and upload your edited file. Your file has not been accepted."
          );
        }

        if (response?.errors && response.errors.length > 0) {
          setErrors(response.errors);
        }
      }
    });

    setFileInputResetValue(fileInputResetValue + 1);
    setFile(undefined);
    setButtonIsDisabled(true);
    setIsSubmitting(false);
  };

  return (
    <div className="grid-row">
      <div className="prime-container card-container">
        <div className="usa-card__header">
          <h2>Upload your results</h2>
        </div>
        <div className="usa-card__body padding-y-2 maxw-prose">
          <p>
            Report results in bulk using a comma-separated values (CSV)
            spreadsheet. To upload your spreadsheet:
          </p>
          <ol className="usa-list">
            <li>
              <a href="https://reportstream.cdc.gov/assets/csv/ReportStream-StandardCSV-ExampleData-20220509.csv">
                Download the spreadsheet template
              </a>{" "}
            </li>
            <li>
              Format and add your data following the template and upload guide
            </li>
            <li>Save your spreadsheet as a CSV</li>
            <li>Upload your CSV here</li>
          </ol>
          <p>
            For more information about preparing your spreadsheet, visit our{" "}
            <LinkWithQuery to="/results/upload/submit/guide">
              <strong>spreadsheet upload guide</strong>
            </LinkWithQuery>
            .
          </p>
          {reportId && (
            <div>
              <div className="usa-alert usa-alert--success">
                <div className="usa-alert__body">
                  <h4 className="usa-alert__heading">Success: File Accepted</h4>
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
          {errors && errors.length > 0 && (
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
                        <td>{e?.["message"]} </td>
                        <td>Row(s): {e?.["indices"]}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <FormGroup className="margin-bottom-3">
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
        </div>
      </div>
    </div>
  );
};

export default Uploads;
