import React, { useEffect, useState } from "react";
import { FormGroup } from "@trussworks/react-uswds";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useLocation, useNavigate } from "react-router-dom";

import { useDocumentTitle } from "../utils/hooks";
import Button from "../commonComponents/Button/Button";
import RadioGroup from "../commonComponents/RadioGroup";
import Dropdown from "../commonComponents/Dropdown";
import SingleFileInput from "../commonComponents/SingleFileInput";
import { Facility, FeedbackMessage } from "../../generated/graphql";
import { showError } from "../utils/srToast";
import { FileUploadService } from "../../fileUploadService/FileUploadService";
import iconLoader from "../../img/loader.svg";
import { getFacilityIdFromUrl } from "../utils/url";

import { AddPatientHeader } from "./Components/AddPatientsHeader";

import "./UploadPatients.scss";

const PAYLOAD_MAX_BYTES = 50 * 1000 * 1000;
const MAX_ROW_COUNT = 10000;

const UploadPatients = ({ isAdmin }: { isAdmin: boolean }) => {
  useDocumentTitle("Add Patient");
  const [facilityAmount, setFacilityAmount] = useState<string>();
  const [buttonIsDisabled, setButtonIsDisabled] = useState(true);
  const [selectedFacility, setSelectedFacility] = useState<Facility>();
  const [file, setFile] = useState<File>();
  const [errors, setErrors] = useState<
    Array<FeedbackMessage | undefined | null>
  >([]);
  const [errorMessageText, setErrorMessageText] = useState("");
  const [includeGuideInErrorMessage, setIncludeGuideInErrorMessage] =
    useState(true);
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

  function onFacilitySelect() {
    return (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selected = facilities.find((f) => f.id === e.target.value);
      if (selected) {
        setSelectedFacility(selected);
      }
    };
  }
  const handleResponseStatus = async (res: Response) => {
    if (res.status !== 200) {
      setStatus("fail");
      setErrorMessageText(
        "There was a server error. Your file has not been accepted."
      );
    } else {
      const response = await res?.json();

      if (response.status === "FAILURE") {
        setStatus("fail");
        if (response?.errors?.length) {
          setErrorMessageText(
            "Please resolve the errors below and upload your edited file."
          );
          setIncludeGuideInErrorMessage(true);
          setErrors(response.errors);
        } else {
          setErrorMessageText(
            "There was a server error. Your file has not been accepted."
          );
          setIncludeGuideInErrorMessage(true);
        }
      } else {
        setStatus("success");
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
        if (currentFile.size > PAYLOAD_MAX_BYTES) {
          setStatus("fail");
          setErrorMessageText(
            `"${currentFile.name}" is too large for SimpleReport to process. Please limit each upload to 50 MB.`
          );
          setIncludeGuideInErrorMessage(false);
          return;
        }

        const fileText = await currentFile.text();
        const lineCount = (fileText.match(/\n/g) || []).length + 1;
        if (lineCount > MAX_ROW_COUNT) {
          setStatus("fail");
          setErrorMessageText(
            `“${
              currentFile.name
            }” has too many rows for SimpleReport to process. Please limit each upload to ${MAX_ROW_COUNT.toLocaleString()} rows.`
          );
          setIncludeGuideInErrorMessage(false);
          return;
        }

        setFile(currentFile);
        setButtonIsDisabled(false);
        setStatus("");
      } catch (err: any) {
        showError(`An unexpected error happened: '${err.toString()}'`);
      }
    };
  }

  function handleSubmit() {
    return async (event: React.FormEvent<HTMLButtonElement>) => {
      event.preventDefault();

      setStatus("submitting");
      setButtonIsDisabled(true);
      setErrors([]);
      setErrorMessageText("");

      if (!file || file.size === 0) {
        setStatus("fail");
        setButtonIsDisabled(false);
        setErrorMessageText("Invalid file");
        setIncludeGuideInErrorMessage(true);
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
  const navigate = useNavigate();
  useEffect(() => {
    if (!isAdmin) {
      navigate("/queue");
    }
  }, [navigate, isAdmin]);

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
                1. Setup your spreadsheet
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
                >
                  View patient bulk upload guide
                </a>
                <a
                  href="/assets/resources/patient_upload_example.csv"
                  className={"usa-button usa-button--outline"}
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
                        <FontAwesomeIcon icon={faXmark} />
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
                    {errorMessageText && (
                      <div className="usa-alert usa-alert--error maxw-560">
                        <div className="usa-alert__body">
                          <span className="usa-alert__heading text-bold">
                            Error: File not accepted
                          </span>
                          <button
                            className="Toastify__close-button Toastify__close-button--default position-absolute top-0 right-0"
                            type="button"
                            aria-label="close"
                            onClick={() => {
                              setErrorMessageText("");
                              setErrors([]);
                            }}
                          >
                            <FontAwesomeIcon icon={faXmark} />
                          </button>
                          <p className="usa-alert__text">
                            {errorMessageText}
                            {includeGuideInErrorMessage && (
                              <div>
                                See the{" "}
                                <a
                                  target="_blank"
                                  href="/using-simplereport/manage-people-you-test/bulk-upload-patients/#preparing-your-spreadsheet-data"
                                >
                                  patient bulk upload guide
                                </a>{" "}
                                for details about accepted values.
                              </div>
                            )}
                          </p>
                        </div>
                      </div>
                    )}
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
