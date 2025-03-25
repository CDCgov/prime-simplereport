import moment from "moment";
import React, { Dispatch } from "react";

import Dropdown from "../commonComponents/Dropdown";
import TextInput from "../commonComponents/TextInput";
import { formatDate } from "../utils/date";

import { useSpecimenTypeOptionList } from "./LabReportFormUtils";
import { UniversalSpecimen } from "./types";

type SpecimenFormSectionProps = {
  specimen: UniversalSpecimen;
  setSpecimen: Dispatch<UniversalSpecimen>;
};

const SpecimenFormSection = ({
  specimen,
  setSpecimen,
}: SpecimenFormSectionProps) => {
  const specimenOption = useSpecimenTypeOptionList();

  return (
    <>
      <div className="grid-row">
        <div className="grid-col-auto">
          <h2 className={"font-sans-md"}>Specimen Info</h2>
        </div>
      </div>
      <div className="grid-row grid-gap padding-bottom-2">
        <div className="grid-col-auto">
          <Dropdown
            label="Specimen type"
            name="specimen-type"
            selectedValue={specimen.snomed_type_code}
            onChange={(e) =>
              setSpecimen({
                ...specimen,
                snomed_type_code: e.target.value,
              })
            }
            className="card-dropdown"
            required={true}
            options={specimenOption}
          />
        </div>
        <div className="grid-col-auto">
          <TextInput
            name="specimen-collection-date"
            type="date"
            label="Specimen collection date"
            min={formatDate(new Date("Jan 1, 2020"))}
            max={formatDate(moment().toDate())}
            value={formatDate(moment(specimen.collection_date).toDate())}
            onChange={(e) => {
              setSpecimen({
                ...specimen,
                collection_date: e.target.value,
              });
            }}
          ></TextInput>
        </div>
        <div className="grid-col-auto">
          <TextInput
            name="specimen-collection-time"
            type="time"
            label="Specimen collection time"
            step="60"
            value={specimen.collection_time}
            onChange={(e) => {
              setSpecimen({
                ...specimen,
                collection_time: e.target.value,
              });
            }}
          ></TextInput>
        </div>
        <div className="grid-col-auto">
          <TextInput
            name="specimen-received-date"
            type="date"
            label="Specimen received_date"
            min={formatDate(new Date("Jan 1, 2020"))}
            max={formatDate(moment().toDate())}
            value={formatDate(moment(specimen.received_date).toDate())}
            onChange={(e) => {
              setSpecimen({ ...specimen, received_date: e.target.value });
            }}
          ></TextInput>
        </div>
        <div className="grid-col-auto">
          <TextInput
            name={"specimen-collection-location-name"}
            type={"text"}
            label={"Specimen collection location name"}
            onChange={(e) =>
              setSpecimen({
                ...specimen,
                collection_location_name: e.target.value,
              })
            }
            value={specimen.collection_location_name}
          ></TextInput>
        </div>
        <div className="grid-col-auto">
          <TextInput
            name={"specimen-collection-location-code"}
            type={"text"}
            label={"Specimen collection location code"}
            onChange={(e) =>
              setSpecimen({
                ...specimen,
                collection_location_code: e.target.value,
              })
            }
            value={specimen.collection_location_code}
          ></TextInput>
        </div>
      </div>
    </>
  );
};

export default SpecimenFormSection;
