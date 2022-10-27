import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Button, FormGroup, FileInput } from "@trussworks/react-uswds";

import { showError } from "../../utils/srToast";
import { FeedbackMessage } from "../../../generated/graphql";
import { useDocumentTitle } from "../../utils/hooks";
import { LinkWithQuery } from "../../commonComponents/LinkWithQuery";
import { FileUploadService } from "../../../fileUploadService/FileUploadService";
import "../HeaderSizeFix.scss";
import { getAppInsights } from "../../TelemetryService";
import { RootState } from "../../store";

const PAYLOAD_MAX_BYTES = 50 * 1000 * 1000;
const REPORT_MAX_ITEMS = 10000;
const REPORT_MAX_ITEM_COLUMNS = 2000;

const Uploads = () => {
  useDocumentTitle("Upload spreadsheet");

  const appInsights = getAppInsights();
  const orgName = useSelector<RootState, string>(
    (state) => state.organization?.name
  );
  const user = useSelector<RootState, User>((state) => state.user);

  const [fileInputResetValue, setFileInputResetValue] = useState(0);
  const [buttonIsDisabled, setButtonIsDisabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File>();

  const [reportId, setReportId] = useState<string | null>(null);

  const [errors, setErrors] = useState<
    Array<FeedbackMessage | undefined | null>
  >([]);
  const [errorMessageText, setErrorMessageText] = useState<string | null>(null);

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

      if (currentFile.size > PAYLOAD_MAX_BYTES) {
        const maxKBytes = (PAYLOAD_MAX_BYTES / 1024).toLocaleString("en-US", {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
        });
        showError(
          `The file '${currentFile.name}' is too large.  The maximum file size is ${maxKBytes}k`,
          "Invalid file"
        );
        return;
      }

      const fileText = await currentFile.text();
      const lineCount = (fileText.match(/\n/g) || []).length + 1;
      if (lineCount > REPORT_MAX_ITEMS) {
        showError(
          `The file '${currentFile.name}' has too many rows. The maximum number of rows is ${REPORT_MAX_ITEMS}.`,
          "Invalid file"
        );
        return;
      }

      if (lineCount <= 1) {
        showError(
          `The file '${currentFile.name}' doesn't contain any valid data. File should have a header line and at least one line of data.`,
          "Invalid file"
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
          `The file '${currentFile.name}' has too many columns. The maximum number of allowed columns is ${REPORT_MAX_ITEM_COLUMNS}.`,
          "Invalid file"
        );
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
    setReportId(null);
    setErrorMessageText(null);
    setErrors([]);

    if (!file || file.size === 0) {
      setErrorMessageText(
        "Please resolve the errors below and upload your edited file. Your file has not been accepted."
      );
      const errorMessage = {} as FeedbackMessage;
      errorMessage.message = "Invalid File";
      setErrors([errorMessage]);
      return;
    }

    FileUploadService.uploadResults(file).then(async (res) => {
      setIsSubmitting(false);
      setFileInputResetValue(fileInputResetValue + 1);
      setFile(undefined);

      if (res.status !== 200) {
        setErrorMessageText(
          "There was a server error. Your file has not been accepted."
        );
        appInsights?.trackEvent({
          name: "Spreadsheet upload server error",
          properties: {
            org: orgName,
            user: user?.email,
          },
        });
      } else {
        const response = await res.json();

        if (response?.reportId) {
          setReportId(response?.reportId);
          appInsights?.trackEvent({
            name: "Spreadsheet upload success",
            properties: {
              "report ID": response.reportId,
              org: orgName,
              user: user?.email,
            },
          });
        }

        if (response?.errors?.length) {
          setErrorMessageText(
            "Please resolve the errors below and upload your edited file. Your file has not been accepted."
          );
          setErrors(response.errors);
          appInsights?.trackEvent({
            name: "Spreadsheet upload validation failure",
            properties: {
              errors: response.errors,
              org: orgName,
              user: user?.email,
            },
          });
        }
      }
    });
  };

  return (
    <div className="grid-row header-size-fix">
      <div className="prime-container card-container">
        <div className="usa-card__header">
          <h1>Upload your results</h1>
        </div>
        <div className="usa-alert usa-alert--info margin-left-105em margin-right-105em maxw-tablet-lg">
          <div className="usa-alert__body">
            <h3 className="usa-alert__heading">
              What is the bulk results uploader?
            </h3>
            <p className="usa-alert__text">
              <em>
                This feature is in beta. That means it’s new, and we’ll continue
                to update and improve it for our users. Though the feature is in
                beta, it will route all the results you submit to the
                appropriate public health department(s). Results you upload here
                will not appear individually in the "Test results" page.
              </em>{" "}
              <br />
              <br /> The results uploader allows you to report test results in
              bulk using a CSV file. While we expect most SimpleReport users
              will continue to report through the regular process, this feature
              can serve labs and others with an information system that exports
              spreadsheets, such as an EMR.{" "}
              <LinkWithQuery to="/results/upload/submit/guide">
                <strong>Learn more about how it works</strong>
              </LinkWithQuery>
              .
            </p>
          </div>
        </div>
        <div className="usa-card__body padding-y-2 maxw-prose">
          <p>
            Report results in bulk using a comma-separated values (CSV)
            spreadsheet. To upload your spreadsheet:
          </p>
          <ol className="usa-list">
            <li>
              <a
                href="/assets/resources/test_results_example_10-3-2022.csv"
                onClick={() => {
                  appInsights?.trackEvent({
                    name: "Download spreadsheet template",
                  });
                }}
              >
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
                  <h3 className="usa-alert__heading">Success: File Accepted</h3>
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
          {errorMessageText && (
            <div>
              <div className="usa-alert usa-alert--error" role="alert">
                <div className="usa-alert__body">
                  <h3 className="usa-alert__heading">
                    Error: File not accepted
                  </h3>
                  <p className="usa-alert__text">{errorMessageText}</p>
                </div>
              </div>
              {errors?.length > 0 && (
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
              )}
            </div>
          )}
          <FormGroup className="margin-bottom-3">
            <FileInput
              key={fileInputResetValue}
              id="upload-csv-input"
              name="upload-csv-input"
              aria-label="Choose CSV file"
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
