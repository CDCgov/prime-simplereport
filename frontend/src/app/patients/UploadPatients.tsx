import React, { ReactElement, useEffect, useState } from "react";
import { FormGroup } from "@trussworks/react-uswds";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useLocation } from "react-router-dom";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { IAutoExceptionTelemetry } from "@microsoft/applicationinsights-common/src/Interfaces/IExceptionTelemetry";

import { useDocumentTitle } from "../utils/hooks";
import Button from "../commonComponents/Button/Button";
import RadioGroup from "../commonComponents/RadioGroup";
import Dropdown from "../commonComponents/Dropdown";
import SingleFileInput from "../commonComponents/SingleFileInput";
import { getAppInsights } from "../TelemetryService";
import { Facility, FeedbackMessage } from "../../generated/graphql";
import { showError } from "../utils/srToast";
import { FileUploadService } from "../../fileUploadService/FileUploadService";
import iconLoader from "../../img/loader.svg";
import { getFacilityIdFromUrl } from "../utils/url";
import { maskPatientUploadValidationError } from "../utils/dataMasking";
import {
  MAX_CSV_UPLOAD_BYTES,
  MAX_CSV_UPLOAD_ROW_COUNT,
} from "../../config/constants";

import { AddPatientHeader } from "./Components/AddPatientsHeader";

import "./UploadPatients.scss";

type ErrorMessage = {
  header: string;
  body: ReactElement | null;
  includeGuide: boolean;
};

type ValidationError = {
  scope?: "item";
  message: string;
  indices?: number[] | null;
};

const UploadPatients = () => {
  useDocumentTitle("Import patients from spreadsheet");
  const [facilityAmount, setFacilityAmount] = useState<string>();
  const [buttonIsDisabled, setButtonIsDisabled] = useState(true);
  const [selectedFacility, setSelectedFacility] = useState<Facility>();
  const [file, setFile] = useState<File>();
  const [errors, setErrors] = useState<
    Array<FeedbackMessage | undefined | null>
  >([]);
  const [isFileValid, setFileValid] = useState<boolean>(true);

  const appInsights = getAppInsights();

  const [errorMessage, setErrorMessage] = useState<ErrorMessage>({
    header: "",
    body: null,
    includeGuide: true,
  });
  const [status, setStatus] = useState<
    "submitting" | "complete" | "success" | "fail" | ""
  >("");

  const facilities = useSelector(
    (state: any) => (state?.facilities as Facility[]) || []
  );
  const activeFacilityId = getFacilityIdFromUrl(useLocation());
  const facility = selectedFacility ||
    facilities.find((f) => f.id === activeFacilityId) ||
    facilities[0] || { id: "", name: "" };

  useEffect(() => {
    performance.mark("patientUpload_pageLanding");

    return () => {
      performance.clearMarks("patientUpload_pageLanding");
      performance.clearMarks("patientUpload_successfulUpload");
      performance.clearMeasures("patientUpload_timeToUpload");
    };
  }, []);

  useEffect(() => {
    if (errorMessage.body) {
      (
        document.getElementsByClassName("usa-alert--error")[0] as HTMLDivElement
      ).focus();
    }
  }, [errorMessage]);

  function onFacilitySelect() {
    return (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selected = facilities.find((f) => f.id === e.target.value);
      if (selected) {
        setSelectedFacility(selected);
      }
    };
  }

  function trackValidationErrors(validationErrors: ValidationError[]): void {
    const trackErrors: Promise<any>[] = validationErrors.map(
      (error) =>
        new Promise<any>((res) => {
          const exception: IAutoExceptionTelemetry = {
            columnNumber: 0,
            error: null,
            lineNumber: 0,
            url: "/app/upload-patients",
            message: maskPatientUploadValidationError(error.message),
          };
          appInsights?.trackException(
            { id: crypto.randomUUID(), exception, severityLevel: 1 },
            { exceptionType: "patientUploadValidationError" }
          );
          return res;
        })
    );

    Promise.allSettled(trackErrors).then(() => {
      /* do nothing*/
    });
  }

  const handleResponseStatus = async (res: Response) => {
    if (res.status !== 200) {
      setStatus("fail");
      setErrorMessage({
        header: "Error: File not accepted",
        body: <>There was a server error. Your file has not been accepted.</>,
        includeGuide: true,
      });
      setFileValid(false);
    } else {
      const response = await res?.json();

      if (response.status === "FAILURE") {
        setStatus("fail");
        if (response?.errors?.length) {
          trackValidationErrors(response.errors);
          setErrorMessage({
            header: "Error: File not accepted",
            body: (
              <>
                Please resolve the errors below and{" "}
                <a href="#upload-patients-file-input">
                  {" "}
                  upload your edited file{" "}
                </a>
                .
              </>
            ),
            includeGuide: true,
          });
          setErrors(response.errors);
          setFileValid(false);
        } else {
          setErrorMessage({
            header: "Error: File not accepted",
            body: (
              <>There was a server error. Your file has not been accepted.</>
            ),
            includeGuide: true,
          });
        }
        setFileValid(false);
      } else {
        performance.clearMarks("patientUpload_successfulUpload");
        performance.clearMeasures("patientUpload_timeToUpload");
        performance.mark("patientUpload_successfulUpload");
        performance.measure(
          "patientUpload_timeToUpload",
          "patientUpload_pageLanding",
          "patientUpload_successfulUpload"
        );
        appInsights?.trackMetric(
          {
            name: "patientUpload_timeToUpload",
            average: performance.getEntriesByName(
              "patientUpload_timeToUpload"
            )?.[0]?.duration,
          },
          { srFeature: "patientUpload" }
        );
        setStatus("success");
        setFileValid(true);
      }
    }
  };
  function handleFileChange() {
    return async (event: React.ChangeEvent<HTMLInputElement>) => {
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
        setStatus("");
        setFileValid(true);
      } catch (err: any) {
        showError(`An unexpected error happened: '${err.toString()}'`);
        setFileValid(false);
      }
    };
  }

  function handleSubmit() {
    return async (event: React.FormEvent<HTMLButtonElement>) => {
      event.preventDefault();

      setStatus("submitting");
      setButtonIsDisabled(true);
      setErrors([]);
      setErrorMessage({
        header: "",
        body: null,
        includeGuide: false,
      });

      if (!file || file.size === 0) {
        setStatus("fail");
        setButtonIsDisabled(false);
        setErrorMessage({
          header: "Error: Invalid file",
          body: <>File is missing or empty.</>,
          includeGuide: true,
        });
        setFileValid(false);
        trackValidationErrors([{ message: "File missing or empty." }]);
        return;
      }

      const fileText = await file.text();
      if (file.size > MAX_CSV_UPLOAD_BYTES) {
        setStatus("fail");
        setErrorMessage({
          header: "Error: File too large",
          body: (
            <>
              {file.name} is too large for SimpleReport to process. Please limit
              each upload to less than 50 MB.
            </>
          ),
          includeGuide: false,
        });
        setFileValid(false);
        trackValidationErrors([{ message: "File too large (size)." }]);
        return;
      }

      const lineCount = (fileText.match(/\n/g) || []).length + 1;
      if (lineCount > MAX_CSV_UPLOAD_ROW_COUNT) {
        setStatus("fail");
        setErrorMessage({
          header: "Error: File too large",
          body: (
            <>
              {file.name} has too many rows for SimpleReport to process. Please
              limit each upload to less than{" "}
              {MAX_CSV_UPLOAD_ROW_COUNT.toLocaleString()} rows.
            </>
          ),
          includeGuide: false,
        });
        setFileValid(false);
        trackValidationErrors([
          { message: "File too large (number of rows)." },
        ]);
        return;
      }

      const facilityId = facilityAmount === "oneFacility" ? facility.id : "";
      FileUploadService.uploadPatients(file, facilityId).then(async (res) => {
        setStatus("complete");
        setFile(undefined);
        setButtonIsDisabled(true);

        await handleResponseStatus(res);
      });
    };
  }
  function renderErrorToast() {
    return (
      <div>
        {errorMessage.body && (
          <div
            className="usa-alert usa-alert--error maxw-560"
            tabIndex={-1}
            role={"alert"}
          >
            <div className="usa-alert__body">
              <span className="usa-alert__heading text-bold">
                {errorMessage.header}
              </span>
              <button
                className="Toastify__close-button Toastify__close-button--default position-absolute top-0 right-0"
                type="button"
                aria-label="close"
                onClick={() => {
                  setErrorMessage({
                    header: "",
                    body: null,
                    includeGuide: false,
                  });
                  setErrors([]);
                }}
              >
                <FontAwesomeIcon icon={faXmark as IconProp} />
              </button>
              <p className="usa-alert__text">
                {errorMessage.body}
                {errorMessage.includeGuide && (
                  <span className="display-block">
                    See the{" "}
                    <a
                      target="_blank"
                      href="/using-simplereport/manage-people-you-test/bulk-upload-patients/#preparing-your-spreadsheet-data"
                    >
                      patient bulk upload guide
                    </a>{" "}
                    for details about accepted values.
                  </span>
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={"prime-edit-patient prime-home flex-1"}>
      <div className={"grid-container margin-bottom-4 maxw-desktop-lg"}>
        <div className="patient__header padding-bottom-0">
          <AddPatientHeader />
        </div>
        <div className={"card padding-top-5 padding-bottom-7"}>
          <ol className={"prime-ul margin-0"}>
            <li>
              <h2
                className={"margin-0 font-sans-lg text-light line-height-225"}
              >
                1. Set up your spreadsheet
              </h2>
              <div className={"margin-left-3"}>
                <div
                  className={
                    "usa-summary-box margin-top-3 margin-bottom-3 margin-right-3 maxw-tablet-lg"
                  }
                >
                  <span className="usa-alert__heading text-bold">
                    Follow formatting guidelines
                  </span>
                  <p className="usa-alert__text margin-top-0">
                    To upload patients in bulk, spreadsheets need to match
                    SimpleReport data requirements. Follow the Patient bulk
                    upload guide closely to format your CSV before uploading it
                    below.
                  </p>
                </div>
                <a
                  href="/using-simplereport/manage-people-you-test/bulk-upload-patients/#preparing-your-spreadsheet-data"
                  className={"usa-button margin-right-105"}
                  onClick={() =>
                    appInsights?.trackEvent({
                      name: "viewPatientBulkUploadGuide",
                    })
                  }
                >
                  View patient bulk upload guide
                </a>
                <a
                  href="/assets/resources/patient_upload_example.csv"
                  className={"usa-button usa-button--outline"}
                  onClick={() =>
                    appInsights?.trackEvent({
                      name: "downloadPatientBulkUploadSample",
                    })
                  }
                >
                  Download spreadsheet template
                </a>
              </div>
            </li>

            <li>
              <h2
                className={
                  "margin-top-7 margin-bottom-1 font-sans-lg text-light line-height-225"
                }
              >
                2. Would you like to import these patients to one facility OR
                all facilities?
              </h2>
              <div className={"margin-left-3"}>
                <p className={"maxw-710 line-height-sans-4"}>
                  If you plan to test patients at more than one facility, we
                  recommend adding them to all facilities. You can't select
                  multiple facilities individually.
                </p>
                <RadioGroup
                  wrapperClassName="margin-top-2"
                  inputClassName={"usa-radio__input--tile"}
                  name="facilitySector"
                  legend="Select facility"
                  legendSrOnly
                  buttons={[
                    {
                      value: "oneFacility",
                      label: "One facility",
                    },
                    {
                      value: "allFacility",
                      label: "All facilities",
                    },
                  ]}
                  selectedRadio={facilityAmount}
                  onChange={setFacilityAmount}
                  variant="horizontal"
                  renderAsForm
                />
                {facilityAmount === "oneFacility" && (
                  <>
                    <div className={"margin-top-205"}>Which facility?</div>
                    <Dropdown
                      aria-label={"Select facility"}
                      selectedValue={facility.id}
                      onChange={onFacilitySelect()}
                      className={"grid-col-4"}
                      options={facilities.map(({ name, id }) => ({
                        label: name,
                        value: id,
                      }))}
                    />
                  </>
                )}
              </div>
            </li>
            <li>
              <h2
                className={
                  "margin-top-7 margin-bottom-1 font-sans-lg text-light line-height-225"
                }
              >
                3. Upload your spreadsheet
                {facilityAmount === "oneFacility" && " for " + facility.name}.
              </h2>
              <div className={"margin-left-3"}>
                <p className={"maxw-710 line-height-sans-4"}>
                  The system will check the data for errors before adding your
                  patients to SimpleReport.
                </p>
                {status === "success" && (
                  <div className="usa-alert usa-alert--success maxw-560 margin-top-3 outline-0">
                    <div className="usa-alert__body">
                      <span className="usa-alert__heading text-bold">
                        Success: Data confirmed
                      </span>
                      <button
                        className="Toastify__close-button Toastify__close-button--default position-absolute top-0 right-0"
                        type="button"
                        aria-label="close"
                        onClick={() => setStatus("")}
                      >
                        <FontAwesomeIcon icon={faXmark as IconProp} />
                      </button>
                      <p className="usa-alert__text">
                        We're now adding your patients to SimpleReport. You can
                        leave this page, as the process can take up to 10
                        minutes or more. We'll email you when the upload is
                        complete.
                      </p>
                    </div>
                  </div>
                )}
                {status === "fail" && (
                  <div className={"margin-top-3"}>
                    {renderErrorToast()}
                    {errors.length > 0 && (
                      <table className="usa-table usa-table--borderless">
                        <thead>
                          <tr>
                            <th
                              className={"thick-bottom-border padding-left-0"}
                            >
                              Edits needed
                            </th>
                            <th
                              className={"thick-bottom-border padding-left-0"}
                            >
                              Areas requiring edits
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {errors.map((e) => {
                            return (
                              <tr key={(e?.message || "") + (e?.indices || "")}>
                                <td className={"border-bottom-0"}>
                                  {e?.["message"]}{" "}
                                </td>
                                <td className={"border-bottom-0"}>
                                  {e?.["indices"] &&
                                    "Row(s): " + e?.["indices"]?.join(", ")}
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
                  {status === "submitting" ? (
                    <div className={"usa-file-input"}>
                      <div className={"usa-file-input__target"}>
                        <div className={"margin-top-1"}>
                          <span className="usa-file-input__drag-text font-sans-xs text-bold">
                            Uploading patient information...
                          </span>
                          <div className={"margin-top-1"}>
                            <img
                              src={iconLoader}
                              alt="submitting"
                              className={"square-5"}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <SingleFileInput
                      id="upload-patients-file-input"
                      name="upload-patients-file-input"
                      ariaLabel="Choose CSV file"
                      accept="text/csv, .csv"
                      ariaInvalid={!isFileValid}
                      required
                      onChange={handleFileChange()}
                    />
                  )}
                </FormGroup>
                <Button
                  disabled={buttonIsDisabled || facilityAmount === undefined}
                  onClick={handleSubmit()}
                >
                  Upload CSV file
                </Button>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default UploadPatients;
