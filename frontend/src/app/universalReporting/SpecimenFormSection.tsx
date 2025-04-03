import moment from "moment";
import React, { Dispatch } from "react";

import Dropdown from "../commonComponents/Dropdown";
import TextInput from "../commonComponents/TextInput";
import { formatDate } from "../utils/date";
import { Specimen, SpecimenInput } from "../../generated/graphql";

import { buildSpecimenOptionList } from "./LabReportFormUtils";

type SpecimenFormSectionProps = {
  specimen: SpecimenInput;
  setSpecimen: Dispatch<SpecimenInput>;
  specimenList: Specimen[];
};

const SpecimenFormSection = ({
  specimenList,
  specimen,
  setSpecimen,
}: SpecimenFormSectionProps) => {
  const specimenOption = buildSpecimenOptionList(specimenList);

  const handleCollectionDateUpdate = (value: string) => {
    if (value) {
      const newCollectionDate = moment(value);
      if (specimen.collectionDate) {
        const previousCollectionDate = moment(specimen.collectionDate);
        newCollectionDate.hour(previousCollectionDate.hour());
        newCollectionDate.minute(previousCollectionDate.minute());
      }
      setSpecimen({
        ...specimen,
        collectionDate: newCollectionDate.toISOString(),
      });
    }
  };

  const handleCollectionTimeUpdate = (value: string) => {
    if (value) {
      const [hours, minutes] = value.split(":");
      const newCollectionDate = moment(specimen.collectionDate)
        .hours(parseInt(hours))
        .minutes(parseInt(minutes));
      setSpecimen({
        ...specimen,
        collectionDate: newCollectionDate.toISOString(),
      });
    }
  };

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
            onChange={(e) => handleCollectionDateUpdate(e.target.value)}
          ></TextInput>
        </div>
        <div className="grid-col-auto">
          <TextInput
            name="specimen-collection-time"
            type="time"
            label="Specimen collection time"
            step="60"
            value={moment(specimen.collectionDate).format("HH:mm")}
            onChange={(e) => handleCollectionTimeUpdate(e.target.value)}
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
              setSpecimen({
                ...specimen,
                receivedDate: moment(e.target.value),
              });
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
