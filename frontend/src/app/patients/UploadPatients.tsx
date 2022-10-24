import React from "react";
import { FileInput, FormGroup } from "@trussworks/react-uswds";

import { useDocumentTitle } from "../utils/hooks";
import Button from "../commonComponents/Button/Button";
import RadioGroup from "../commonComponents/RadioGroup";

import { AddPatientHeader } from "./Components/AddPatientsHeader";

const UploadPatients = () => {
  useDocumentTitle("Add Patient");

  return (
    <div className={"prime-edit-patient prime-home flex-1"}>
      <div className={"grid-container margin-bottom-4"}>
        <div className="patient__header">
          <AddPatientHeader />
        </div>
        <div className={"card"}>
          1. Setup your spreadsheet
          <div className="usa-alert usa-alert--info usa-alert--no-icon margin-left-105em margin-right-105em maxw-tablet-lg">
            <div className="usa-alert__body">
              <h3 className="usa-alert__heading">
                Follow formatting guidelines
              </h3>
              <p className="usa-alert__text">
                To upload patients in bulk, spreadsheets need to match
                SimpleReport data requirements. Follow the Patient bulk upload
                guide closely to format your CSV before uploading it below.
              </p>
            </div>
          </div>
          <div>
            <Button>View patient bulk upload guide</Button>
            <Button variant={"outline"}>Download spreadsheet template</Button>
          </div>
          <div>
            2. Would you like to import these patients to one facility OR all
            facilities?
          </div>
          <div>
            If you plan to test patients at more than one facility, we recommend
            adding them to all facilities. You can't select multiple facilities
            individually.
          </div>
          <RadioGroup
            wrapperClassName="margin-top-1"
            inputClassName={"usa-radio__input--tile"}
            name="facilitySector"
            legend="Select facility"
            legendSrOnly
            buttons={[
              {
                value: "current",
                label: "One facility",
              },
              {
                value: "all",
                label: "All facilities",
              },
            ]}
            // selectedRadio={selectedFacility}
            onChange={() => {}}
            variant="horizontal"
          />
          <div>3. Upload your spreadsheet.</div>
          <div>
            The spreadsheet may take 10 or more minutes to upload. You do not
            need to stay on this page. We'll email you if you need to fix any
            errors or when the upload is complete.
          </div>
          <FormGroup className="margin-bottom-3">
            <FileInput
              // key={fileInputResetValue}
              id="upload-csv-input"
              name="upload-csv-input"
              aria-label="Choose CSV file"
              accept="text/csv, .csv"
              // onChange={(e) => handleFileChange(e)}
              required
            />
          </FormGroup>
          <div>
            <Button>Upload CSV file</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPatients;
