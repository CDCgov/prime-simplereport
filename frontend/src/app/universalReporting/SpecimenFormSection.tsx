import moment from "moment";
import React, { Dispatch } from "react";

import Dropdown from "../commonComponents/Dropdown";
import TextInput from "../commonComponents/TextInput";
import { formatDate } from "../utils/date";
import { SpecimenInput } from "../../generated/graphql";

import { useSpecimenTypeOptionList } from "./LabReportFormUtils";

type SpecimenFormSectionProps = {
  specimen: SpecimenInput;
  setSpecimen: Dispatch<SpecimenInput>;
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
          <h2 className={"font-sans-lg"}>Specimen Info</h2>
        </div>
      </div>
      <div className="grid-row grid-gap">
        <div className="grid-col-8">
          <Dropdown
            label="Specimen type"
            name="specimen-type"
            selectedValue={specimen.snomedTypeCode}
            onChange={(e) =>
              setSpecimen({
                ...specimen,
                snomedTypeCode: e.target.value,
              })
            }
            className="card-dropdown"
            required={true}
            options={specimenOption}
          />
        </div>
      </div>
      <div className="grid-row grid-gap">
        <div className="grid-col-auto">
          <TextInput
            name="specimen-collection-date"
            type="date"
            label="Specimen collection date"
            min={formatDate(new Date("Jan 1, 2020"))}
            max={formatDate(moment().toDate())}
            value={formatDate(moment(specimen.collectionDate).toDate())}
            onChange={(e) => {
              setSpecimen({
                ...specimen,
                collectionDate: e.target.value,
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
            value={specimen.collectionTime ?? ""}
            onChange={(e) => {
              setSpecimen({
                ...specimen,
                collectionTime: e.target.value,
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
            value={formatDate(moment(specimen.receivedDate).toDate())}
            onChange={(e) => {
              setSpecimen({ ...specimen, receivedDate: e.target.value });
            }}
          ></TextInput>
        </div>
      </div>
      <div className="grid-row grid-gap">
        <div className="grid-col-4">
          <TextInput
            name={"specimen-collection-location-name"}
            type={"text"}
            label={"Specimen collection location name"}
            onChange={(e) =>
              setSpecimen({
                ...specimen,
                collectionLocationName: e.target.value,
              })
            }
            value={specimen.collectionLocationName ?? ""}
          ></TextInput>
        </div>
        <div className="grid-col-4">
          <TextInput
            name={"specimen-collection-location-code"}
            type={"text"}
            label={"Specimen collection location code"}
            onChange={(e) =>
              setSpecimen({
                ...specimen,
                collectionLocationCode: e.target.value,
              })
            }
            value={specimen.collectionLocationCode ?? ""}
          ></TextInput>
        </div>
      </div>
    </>
  );
};

export default SpecimenFormSection;
