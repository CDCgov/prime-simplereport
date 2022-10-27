import React, { useState } from "react";
import { FileInput, FormGroup } from "@trussworks/react-uswds";
import { useSelector } from "react-redux";

import { useDocumentTitle } from "../utils/hooks";
import Button from "../commonComponents/Button/Button";
import RadioGroup from "../commonComponents/RadioGroup";
import Dropdown from "../commonComponents/Dropdown";
import { Facility, FeedbackMessage } from "../../generated/graphql";
import { showError } from "../utils/srToast";
import { FileUploadService } from "../../fileUploadService/FileUploadService";

import { AddPatientHeader } from "./Components/AddPatientsHeader";

const UploadPatients = () => {
  useDocumentTitle("Add Patient");
  const [facilityAmount, setFacilityAmount] = useState<string>();
  const [buttonIsDisabled, setButtonIsDisabled] = useState(true);
  const [selectedFacility, setSelectedFacility] = useState<Facility>();
  const [file, setFile] = useState<File>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<
    Array<FeedbackMessage | undefined | null>
  >([]);
  const [errorMessageText, setErrorMessageText] = useState("");
  const [status, setStatus] = useState("");

  const facilities = useSelector(
    (state: any) => (state?.facilities as Facility[]) || []
  );
  const facility = selectedFacility || facilities[0] || { id: "", name: "" };

  const onFacilitySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = facilities.find((f) => f.id === e.target.value);
    if (selected) {
      setSelectedFacility(selected);
    }
  };

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
      setFile(currentFile);
      setButtonIsDisabled(false);
      setStatus("");
    } catch (err: any) {
      showError(`An unexpected error happened: '${err.toString()}'`);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLButtonElement>) => {
    event.preventDefault();

    setIsSubmitting(true);
    setButtonIsDisabled(true);
    setErrors([]);
    setErrorMessageText("");

    if (!file || file.size === 0) {
      setButtonIsDisabled(false);
      const errorMessage = {} as FeedbackMessage;
      errorMessage.message = "Invalid File";
      setErrors([errorMessage]);
      return;
    }
    const facilityId = facilityAmount === "oneFacility" ? facility.id : "";
    FileUploadService.uploadPatients(file, facilityId).then(async (res) => {
      setIsSubmitting(false);
      setFile(undefined);
      setButtonIsDisabled(true);

      if (res.status !== 200) {
        setStatus("fail");
        setErrorMessageText(
          "There was a server error. Your file has not been accepted."
        );
        if (res.body) {
          const response = await res.json();

          if (response?.errors?.length) {
            setErrorMessageText(
              "Please resolve the errors below and upload your edited file."
            );
            setErrors(response.errors);
          }
        }
      } else {
        setStatus("success");
      }
    });
  };

  return (
    <div className={"prime-edit-patient prime-home flex-1"}>
      <div className={"grid-container margin-bottom-4"}>
        <div className="patient__header">
          <AddPatientHeader />
        </div>
        <div className={"card"}>
          <span className={"font-sans-lg margin-top-205"}>
            1. Setup your spreadsheet
          </span>
          <div
            className={
              "usa-summary-box margin-top-3 margin-bottom-3 margin-left-205"
            }
          >
            <span className="usa-alert__heading text-bold">
              Follow formatting guidelines
            </span>
            <p className="usa-alert__text">
              To upload patients in bulk, spreadsheets need to match
              SimpleReport data requirements. Follow the Patient bulk upload
              guide closely to format your CSV before uploading it below.
            </p>
          </div>
          <div className={"margin-left-205"}>
            <Button>View patient bulk upload guide</Button>
            <Button variant={"outline"}>Download spreadsheet template</Button>
          </div>
          <div className={"margin-top-7 margin-bottom-1 font-sans-lg"}>
            2. Would you like to import these patients to one facility OR all
            facilities?
          </div>
          <div className={"margin-left-205"}>
            <div>
              If you plan to test patients at more than one facility, we
              recommend adding them to all facilities. You can't select multiple
              facilities individually.
            </div>
            <div>
              <RadioGroup
                wrapperClassName="margin-top-1"
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
            </div>
          </div>
          {facilityAmount === "oneFacility" && (
            <div className={"margin-left-205 margin-top-205"}>
              <div>Which facility?</div>
              <Dropdown
                aria-label={"Select facility"}
                selectedValue={facility.id}
                onChange={onFacilitySelect}
                className={"grid-col-4"}
                options={facilities.map(({ name, id }) => ({
                  label: name,
                  value: id,
                }))}
              />
            </div>
          )}

          <div className={"margin-top-7 margin-bottom-1 font-sans-lg"}>
            3. Upload your spreadsheet
            {facilityAmount === "oneFacility" && " for " + facility.name}.
          </div>
          <div className={"margin-left-205"}>
            The spreadsheet may take 10 or more minutes to upload. You do not
            need to stay on this page. We'll email you if you need to fix any
            errors or when the upload is complete.
          </div>
          <div className={"margin-left-205 margin-top-1"}>
            {status === "success" && (
              <div>
                <div className="usa-alert usa-alert--success maxw-mobile-lg margin-top-3">
                  <div className="usa-alert__body">
                    <h3 className="usa-alert__heading">
                      Success: File Accepted
                    </h3>
                    <p className="usa-alert__text">
                      Patients in your file have been successfully uploaded.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {errorMessageText && (
              <div className={"margin-top-3"}>
                <div className="usa-alert usa-alert--error" role="alert">
                  <div className="usa-alert__body">
                    <h3 className="usa-alert__heading">
                      Error: File not accepted
                    </h3>
                    <p className="usa-alert__text">{errorMessageText}</p>
                  </div>
                </div>
                {errors.length > 0 && (
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
                id="upload-csv-input"
                name="upload-csv-input"
                aria-label="Choose CSV file"
                accept="text/csv, .csv"
                onChange={handleFileChange}
                required
              />
            </FormGroup>
          </div>
          <div>
            <Button
              disabled={buttonIsDisabled || facilityAmount === undefined}
              onClick={handleSubmit}
            >
              {isSubmitting ? "Processing file..." : "Upload CSV file"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPatients;
