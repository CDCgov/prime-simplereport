import React, { useState } from "react";
import { FileInput, FormGroup } from "@trussworks/react-uswds";
import { useSelector } from "react-redux";

import { useDocumentTitle } from "../utils/hooks";
import Button from "../commonComponents/Button/Button";
import RadioGroup from "../commonComponents/RadioGroup";
import Dropdown from "../commonComponents/Dropdown";
import { Facility } from "../../generated/graphql";

import { AddPatientHeader } from "./Components/AddPatientsHeader";

const UploadPatients = () => {
  useDocumentTitle("Add Patient");
  const [facilityAmount, setFacilityAmount] = useState<string>();

  const facilities = useSelector(
    (state) => ((state as any).facilities as Facility[]) || []
  );
  const [selectedFacility, setSelectedFacility] = useState<Facility>();
  const facility = selectedFacility || facilities[0] || { id: "", name: "" };

  const onFacilitySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = facilities.find((f) => f.id === e.target.value);
    if (selected) {
      setSelectedFacility(selected);
    }
  };

  return (
    <div className={"prime-edit-patient prime-home flex-1"}>
      <div className={"grid-container margin-bottom-4"}>
        <div className="patient__header padding-bottom-0">
          <AddPatientHeader />
        </div>
        <div className={"card"}>
          <span style={{ fontSize: "22px", marginTop: "20px" }}>
            1. Setup your spreadsheet
          </span>
          <div
            className={"usa-summary-box"}
            style={{
              marginTop: "24px",
              marginBottom: "24px",
              marginLeft: "20px",
            }}
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
          <div
            style={{
              marginLeft: "20px",
            }}
          >
            <Button>View patient bulk upload guide</Button>
            <Button variant={"outline"}>Download spreadsheet template</Button>
          </div>
          <div
            style={{ fontSize: "22px", marginTop: "56px", marginBottom: "8px" }}
          >
            2. Would you like to import these patients to one facility OR all
            facilities?
          </div>
          <div style={{ marginLeft: "20px" }}>
            If you plan to test patients at more than one facility, we recommend
            adding them to all facilities. You can't select multiple facilities
            individually.
          </div>
          <div style={{ marginLeft: "20px" }}>
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
          {facilityAmount === "oneFacility" && (
            <div style={{ marginLeft: "20px", marginTop: "20px" }}>
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

          <div
            style={{ fontSize: "22px", marginTop: "56px", marginBottom: "8px" }}
          >
            3. Upload your spreadsheet.
          </div>
          <div style={{ marginLeft: "20px" }}>
            The spreadsheet may take 10 or more minutes to upload. You do not
            need to stay on this page. We'll email you if you need to fix any
            errors or when the upload is complete.
          </div>
          <div style={{ marginLeft: "20px", marginTop: "8px" }}>
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
          </div>
          <div>
            <Button>Upload CSV file</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPatients;
