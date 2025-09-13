import moment from "moment";
import React, { Dispatch } from "react";
import { now } from "lodash";

import Dropdown from "../commonComponents/Dropdown";
import TextInput from "../commonComponents/TextInput";
import { formatDate } from "../utils/date";
import {
  SpecimenInput,
  useGetSpecimensByLoincQuery,
} from "../../generated/graphql";

import {
  buildBodySiteOptionsList,
  buildSpecimenOptionList,
} from "./LabReportFormUtils";

type SpecimenFormSectionProps = {
  systemCodeLoinc: string;
  specimen: SpecimenInput;
  setSpecimen: Dispatch<SpecimenInput>;
};

const SpecimenFormSubsection = ({
  systemCodeLoinc,
  specimen,
  setSpecimen,
}: SpecimenFormSectionProps) => {
  let isTestOrderSelected = systemCodeLoinc.length > 0;

  const { data, loading } = useGetSpecimensByLoincQuery({
    variables: {
      loinc: systemCodeLoinc,
    },
    skip: !isTestOrderSelected,
  });

  const specimenList = data?.specimens ?? [];
  const specimenOption = buildSpecimenOptionList(specimenList);
  const bodySiteOptions = buildBodySiteOptionsList(
    specimenList.find((s) => s.snomedCode === specimen.snomedTypeCode)
      ?.bodySiteList ?? []
  );

  const handleSpecimenSelect = async (selectedSnomedCode: string) => {
    const specimenListEntry = specimenList.find(
      (s) => s.snomedCode === selectedSnomedCode
    );
    const specimenBodySiteList = specimenListEntry?.bodySiteList ?? [];

    setSpecimen({
      ...specimen,
      snomedTypeCode: selectedSnomedCode,
      snomedDisplayName: specimenListEntry?.snomedDisplay ?? "",
      collectionBodySiteCode: specimenBodySiteList[0]?.snomedSiteCode ?? "",
      collectionBodySiteName: specimenBodySiteList[0]?.snomedSiteDisplay ?? "",
    });
  };

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
      const newCollectionDate = moment(specimen.collectionDate || now())
        .hours(parseInt(hours))
        .minutes(parseInt(minutes));
      setSpecimen({
        ...specimen,
        collectionDate: newCollectionDate.toISOString(),
      });
    }
  };

  const handleBodySiteChange = (selectedBodySiteCode: string) => {
    setSpecimen({
      ...specimen,
      collectionBodySiteCode: selectedBodySiteCode,
      collectionBodySiteName:
        bodySiteOptions.find(
          (bodySite) => bodySite.value === selectedBodySiteCode
        )?.label ?? "",
    });
  };

  return (
    <>
      <div className="grid-row margin-top-2">
        <div className="grid-col-auto">
          <h3 className={"margin-bottom-0 margin-top-5"}>
            Specimen information
          </h3>
          <p className={"margin-bottom-0"}>
            Choose a specimen type to enter test results
          </p>
        </div>
      </div>
      {loading && <div>Loading specimen list for selected test order...</div>}
      {!loading && (
        <>
          <div className="grid-row grid-gap">
            <div className="grid-col-6 grid-col-mobile">
              <Dropdown
                label="Specimen type"
                name="specimen-type"
                selectedValue={specimen.snomedTypeCode}
                onChange={(e) => handleSpecimenSelect(e.target.value)}
                className="card-dropdown"
                options={specimenOption}
                defaultSelect={true}
                defaultOption={""}
              />
            </div>
          </div>
          <div className="grid-row grid-gap">
            <div className="grid-col-6 grid-col-mobile">
              <TextInput
                name="specimen-collection-date"
                type="date"
                label="Collection date"
                min={formatDate(new Date("Jan 1, 2020"))}
                max={formatDate(moment().toDate())}
                value={formatDate(moment(specimen.collectionDate).toDate())}
                onChange={(e) => handleCollectionDateUpdate(e.target.value)}
              ></TextInput>
            </div>
            <div className="grid-col-6 grid-col-mobile">
              <TextInput
                name="specimen-collection-time"
                type="time"
                label="Collection time"
                step="60"
                value={moment(specimen.collectionDate).format("HH:mm")}
                onChange={(e) => handleCollectionTimeUpdate(e.target.value)}
              ></TextInput>
            </div>
          </div>
          <div className="grid-row grid-gap">
            <div className="grid-col-6 grid-col-mobile">
              <Dropdown
                label="Specimen site (optional)"
                name="specimen-collection-body-site"
                selectedValue={specimen.collectionBodySiteCode ?? ""}
                onChange={(e) => handleBodySiteChange(e.target.value)}
                className="card-dropdown"
                options={bodySiteOptions}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default SpecimenFormSubsection;
