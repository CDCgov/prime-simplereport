import React, { ReactElement, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Button, FormGroup } from "@trussworks/react-uswds";
import { Maybe } from "graphql/jsutils/Maybe";

import { showError } from "../../utils/srToast";
import { FeedbackMessage } from "../../../generated/graphql";
import { useDocumentTitle } from "../../utils/hooks";
import { LinkWithQuery } from "../../commonComponents/LinkWithQuery";
import { FileUploadService } from "../../../fileUploadService/FileUploadService";
import "./Uploads.scss";
import "../HeaderSizeFix.scss";
import { getAppInsights } from "../../TelemetryService";
import { RootState } from "../../store";
import SingleFileInput from "../../commonComponents/SingleFileInput";
import {
  MAX_CSV_UPLOAD_BYTES,
  MAX_CSV_UPLOAD_ROW_COUNT,
} from "../../../config/constants";
import { HashLink } from "../../commonComponents/HashLink";

const REPORT_MAX_ITEM_COLUMNS = 2000;

export type EnhancedFeedbackMessage = FeedbackMessage & {
  indicesRange: string[];
};

export function groupErrors(
  errors: Array<EnhancedFeedbackMessage | undefined | null>
) {
  const extractNumbers = (
    array: Maybe<Maybe<number>[]> | undefined
  ): Array<number> =>
    array ? array.filter((element): element is number => !!element) : [];

  const computeRange = (start: number, end: number) =>
    start === end ? `${start}` : `${start} - ${end}`;

  errors.forEach((error) => {
    const indices = extractNumbers(error?.indices).sort((a, b) => a - b);

    if (error && indices && indices.length > 0) {
      error.indicesRange = [];
      let startRange = indices[0];
      let endRange = indices[0];

      for (let i = 1; i < indices.length; i++) {
        if (endRange + 1 !== indices[i]) {
          // end of the consecutive numbers
          error.indicesRange.push(computeRange(startRange, endRange));
          startRange = indices[i];
        }
        endRange = indices[i];
      }
      // end of the array
      error.indicesRange.push(computeRange(startRange, endRange));
    }
  });
  return errors;
}
export function getErrorMessage(error: EnhancedFeedbackMessage) {
  if (error.message) {
    const headerRegex = /([a-z0-9]+(?:_[a-z0-9]+){1,7})/g;
    return (
      <span data-testid="error-message">
        {error.message.split(headerRegex).map((value) => (
          <span key={`span-${value}`}>
            {headerRegex.test(value) ? (
              <mark data-testid="highlighted-header">
                <code>{value}</code>
              </mark>
            ) : (
              value
            )}
          </span>
        ))}
      </span>
    );
  }
}

export function getGuidance(error: EnhancedFeedbackMessage) {
  const fieldsAcceptSpecificValues = new Set([
    "patient_gender",
    "patient_race",
    "patient_ethnicity",
    "pregnant",
    "employed_in_healthcare",
    "symptomatic_for_disease",
    "resident_congregate_setting",
    "residence_type",
    "hospitalized",
    "icu",
    "test_result_status",
  ]);

  const highlightHeader = (header: string) => (
    <mark>
      <code>{header}</code>
    </mark>
  );

  const getMissingHeaderErrorGuidance = (header: string) => (
    <span data-testid="guidance">
      Include a column with {highlightHeader(header)} as the header.
    </span>
  );

  const getMissingDataErrorGuidance = (header: string) => (
    <span data-testid="guidance">
      {highlightHeader(header)} is a required field. Include values in each row
      under this column.
    </span>
  );

  const getInvalidDataErrorGuidance = (
    header: string,
    required: boolean,
    specificValues: boolean
  ) => {
    const guideLink = (
      <HashLink pathname="/results/upload/submit/guide" hash={header}>
        <u>in the upload guide</u>
      </HashLink>
    );

    if (specificValues) {
      return (
        <span data-testid="guidance">
          {required ? (
            <span>Choose </span>
          ) : (
            <span>If including {highlightHeader(header)}, choose </span>
          )}
          from the accepted values listed under {highlightHeader(header)}{" "}
          {guideLink}.
        </span>
      );
    } else {
      return (
        <span data-testid="guidance">
          {required ? (
            <span>Follow </span>
          ) : (
            <span>If including {highlightHeader(header)}, follow </span>
          )}
          the instructions under {highlightHeader(header)} {guideLink}.
        </span>
      );
    }
  };

  if (error.fieldHeader && error.errorType === "MISSING_HEADER") {
    return getMissingHeaderErrorGuidance(error.fieldHeader);
  } else if (error.fieldHeader && error.errorType === "MISSING_DATA") {
    return getMissingDataErrorGuidance(error.fieldHeader);
  } else if (error.fieldHeader && error.errorType === "INVALID_DATA") {
    return getInvalidDataErrorGuidance(
      error.fieldHeader,
      error.fieldRequired,
      fieldsAcceptSpecificValues.has(error.fieldHeader)
    );
  }
}

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
    Array<EnhancedFeedbackMessage | undefined | null>
  >([]);
  const [errorMessage, setErrorMessage] = useState<ReactElement | null>(null);
  const [isFileValid, setFileValid] = useState<boolean>(true);

  useEffect(() => {
    if (errorMessage) {
      (
        document.getElementsByClassName("usa-alert--error")[0] as HTMLDivElement
      ).focus();
    }
  }, [errorMessage]);

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

      if (currentFile.size > MAX_CSV_UPLOAD_BYTES) {
        const maxKBytes = (MAX_CSV_UPLOAD_BYTES / 1024).toLocaleString(
          "en-US",
          {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
          }
        );
        setFileValid(false);
        showError(
          `The file '${currentFile.name}' is too large.  The maximum file size is ${maxKBytes}k`,
          "Invalid file"
        );
        return;
      }

      const fileText = await currentFile.text();
      const lineCount = (fileText.match(/\n/g) || []).length + 1;
      if (lineCount > MAX_CSV_UPLOAD_ROW_COUNT) {
        setFileValid(false);
        showError(
          `The file '${currentFile.name}' has too many rows. The maximum number of rows is ${MAX_CSV_UPLOAD_ROW_COUNT}.`,
          "Invalid file"
        );
        return;
      }

      if (lineCount <= 1) {
        setFileValid(false);
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
        setFileValid(false);
        showError(
          `The file '${currentFile.name}' has too many columns. The maximum number of allowed columns is ${REPORT_MAX_ITEM_COLUMNS}.`,
          "Invalid file"
        );
        return;
      }
      setFile(currentFile);
      setButtonIsDisabled(false);
      setFileValid(true);
    } catch (err: any) {
      setFileValid(false);
      showError(err.toString(), "An unexpected error happened");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLButtonElement>) => {
    event.preventDefault();

    setIsSubmitting(true);
    setButtonIsDisabled(true);
    setReportId(null);
    setErrorMessage(null);
    setErrors([]);

    if (!file || file.size === 0) {
      setErrorMessage(
        <>
          Please resolve the errors below and{" "}
          <a href={"#upload-csv-input"}>upload your edited file</a>. Your file
          has not been accepted.
        </>
      );
      const errorMessage = {} as EnhancedFeedbackMessage;
      errorMessage.message = "Invalid File";
      setErrors([errorMessage]);
      setFileValid(false);
      return;
    }

    FileUploadService.uploadResults(file).then(async (res) => {
      setIsSubmitting(false);
      setFileInputResetValue(fileInputResetValue + 1);
      setFile(undefined);

      if (res.status !== 200) {
        setErrorMessage(
          <>There was a server error. Your file has not been accepted.</>
        );
        setFileValid(false);
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
          setFileValid(true);
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
          setErrorMessage(
            <>
              Please resolve the errors below and{" "}
              <a href={"#upload-csv-input"}>upload your edited file</a>. Your
              file has not been accepted.
            </>
          );
          setErrors(groupErrors(response.errors));
          setFileValid(false);
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
    <div className="grid-row header-size-fix sr-test-results-uploads">
      <div className="prime-container card-container">
        <div className="usa-card__header">
          <h1>Upload your results</h1>
        </div>
        <div className="usa-alert usa-alert--info margin-left-105em margin-right-105em maxw-tablet-lg">
          <div className="usa-alert__body">
            <h2 className="usa-alert__heading">
              What is the bulk results uploader?
            </h2>
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
          <section>
            <ol className="usa-process-list">
              <li className="usa-process-list__item margin-bottom-1em">
                <p className="usa-process-list__heading">
                  Visit the{" "}
                  <LinkWithQuery to="/results/upload/submit/guide">
                    <strong>spreadsheet upload guide</strong>
                  </LinkWithQuery>
                </p>
              </li>
              <li className="usa-process-list__item margin-bottom-1em">
                <p className="usa-process-list__heading">
                  Download the{" "}
                  <a
                    href="/assets/resources/test_results_example_10-3-2022.csv"
                    onClick={() => {
                      appInsights?.trackEvent({
                        name: "Download spreadsheet template",
                      });
                    }}
                  >
                    spreadsheet template
                  </a>
                </p>
              </li>
              <li className="usa-process-list__item margin-bottom-1em">
                <p className="usa-process-list__heading">
                  Following the guide and template, format your data to match
                  SimpleReport requirements
                </p>
              </li>
              <li className="usa-process-list__item margin-bottom-1em">
                <p className="usa-process-list__heading">
                  Save your spreadsheet in a CSV format (file size limit is 50
                  MB or 10,000 rows)
                </p>
              </li>
              <li className="usa-process-list__item margin-bottom-1em">
                <p className="usa-process-list__heading">
                  Submit your CSV to the uploader below
                </p>
              </li>
            </ol>
          </section>

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
          {errorMessage && (
            <div>
              <div
                className="usa-alert usa-alert--error"
                role="alert"
                tabIndex={-1}
              >
                <div className="usa-alert__body">
                  <h3 className="usa-alert__heading">
                    Error: File not accepted
                  </h3>
                  <p className="usa-alert__text">{errorMessage}</p>
                </div>
              </div>
              {errors?.length > 0 && (
                <table className="usa-table usa-table--borderless">
                  <thead>
                    <tr>
                      <th>Error</th>
                      <th>Guidance</th>
                      <th>Row(s)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {errors.map((e) => {
                      return (
                        <tr key={(e?.message || "") + (e?.indices || "")}>
                          <td>{e && getErrorMessage(e)} </td>
                          <td>
                            <div>{e && getGuidance(e)}</div>
                          </td>
                          <td>
                            {e?.indicesRange &&
                              e?.indicesRange.map((range) => {
                                return (
                                  <div key={range}>
                                    {range}
                                    <br />
                                  </div>
                                );
                              })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}
          <FormGroup className="margin-bottom-3">
            <SingleFileInput
              key={fileInputResetValue}
              id="upload-csv-input"
              name="upload-csv-input"
              ariaLabel="Choose CSV file"
              accept="text/csv, .csv"
              onChange={(e) => handleFileChange(e)}
              required
              ariaInvalid={!isFileValid}
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
