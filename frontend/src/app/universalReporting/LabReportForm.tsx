import React, { useState } from "react";
import { Button } from "@trussworks/react-uswds";

import MultiSelect from "../commonComponents/MultiSelect/MultiSelect";

import { PatientFormSection } from "./PatientFormSection";
import { ProviderFormSection } from "./ProviderFormSection";
import { FacilityFormSection } from "./FacilityFormSection";
import { ResultScaleType, useConditionOptionList } from "./LabReportFormUtils";
import { TestDetailSection } from "./TestDetailSection";
import SpecimenFormSection from "./SpecimenFormSection";
import {
  UniversalFacility,
  UniversalPatient,
  UniversalProvider,
  UniversalSpecimen,
  UniversalTestDetails,
} from "./types";

const LabReportForm = () => {
  const [patient, setPatient] = useState<UniversalPatient>({
    address: "",
    date_of_birth: "",
    email: "",
    ethnicity: "",
    name: "",
    phone: "",
    race: "",
    sex: "",
    tribal_affiliation: "",
  });
  const [provider, setProvider] = useState<UniversalProvider>({
    address: "",
    email: "",
    name: "",
    npi_number: "",
    phone: "",
  });
  const [facility, setFacility] = useState<UniversalFacility>({
    address: "",
    clia: "",
    email: "",
    name: "",
    phone: "",
  });
  const [specimen, setSpecimen] = useState<UniversalSpecimen>({
    collection_date: "",
    collection_location_code: "",
    collection_location_name: "",
    collection_time: "",
    name: "",
    received_date: "",
    snomed_type_code: "",
  });
  const [conditions, setConditions] = useState<string[]>([]);
  const [testDetailList, setTestDetailList] = useState<UniversalTestDetails[]>(
    []
  );

  const conditionOptions = useConditionOptionList();

  const updateConditions = (selectedConditions: string[]) => {
    // could update this in the future to ask the user before accidentally removing a populated test details section
    const filteredTestDetails = [...testDetailList].filter((x) =>
      selectedConditions.includes(x.condition)
    );
    selectedConditions.forEach((value) => {
      if (!filteredTestDetails.some((x) => x.condition === value)) {
        filteredTestDetails.push({
          condition: value,
          loinc_code: "",
          loinc_short_name: "",
          result_date: "",
          result_interpretation: "",
          result_time: "",
          result_type: ResultScaleType.ORDINAL,
          result_value: "",
        });
      }
    });
    setConditions(selectedConditions);
    setTestDetailList(filteredTestDetails);
  };

  const updateTestDetails = (details: UniversalTestDetails) => {
    const updatedList = [...testDetailList];
    const index = testDetailList.findIndex(
      (x) => x.condition === details.condition
    );
    updatedList[index] = details;
    setTestDetailList(updatedList);
  };

  const submitForm = () => {
    console.log("submit form");
  };

  return (
    <div className="prime-home flex-1">
      <div className="grid-container">
        <div className="prime-container card-container">
          <div className="usa-card__header">
            <h1 className={"font-sans-lg"}>Universal Lab Reporting Form</h1>
          </div>
          <div className="usa-card__body padding-top-2">
            <PatientFormSection patient={patient} setPatient={setPatient} />
          </div>
        </div>
        <div className="prime-container card-container">
          <div className="usa-card__body">
            <ProviderFormSection
              provider={provider}
              setProvider={setProvider}
            />
          </div>
        </div>
        <div className="prime-container card-container">
          <div className="usa-card__body">
            <FacilityFormSection
              facility={facility}
              setFacility={setFacility}
            />
          </div>
        </div>
        <div className="prime-container card-container">
          <div className="usa-card__body">
            <SpecimenFormSection
              specimen={specimen}
              setSpecimen={setSpecimen}
            />
          </div>
        </div>
        <div className="prime-container card-container">
          <div className="usa-card__body">
            <div className="grid-row grid-gap">
              <div className="grid-col-auto">
                <h2 className={"font-sans-md"}>Conditions Tested</h2>
              </div>
            </div>
            <div className="grid-row margin-bottom-5">
              <div className="grid-col-auto">
                <MultiSelect
                  name={"selected-conditions"}
                  options={conditionOptions}
                  onChange={(e) => updateConditions(e)}
                  initialSelectedValues={conditions}
                  label={
                    <>
                      Conditions to report{" "}
                      <span className={"text-base-dark"}>
                        (Select all that apply.)
                      </span>
                    </>
                  }
                  required={true}
                />
              </div>
            </div>
          </div>
        </div>
        {testDetailList.map((testDetails) => {
          return (
            <div className="prime-container card-container">
              <div className="usa-card__body">
                <TestDetailSection
                  testDetails={testDetails}
                  updateTestDetails={updateTestDetails}
                />
              </div>
            </div>
          );
        })}
        <div className="padding-bottom-4">
          <Button onClick={() => submitForm()} type={"button"}>
            Submit results
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LabReportForm;
