import React, { useState } from "react";
import { Button } from "@trussworks/react-uswds";
import { v4 as uuidv4 } from "uuid";

import MultiSelect from "../commonComponents/MultiSelect/MultiSelect";
import {
  FacilityReportInput,
  PatientReportInput,
  ProviderReportInput,
  ResultScaleType,
  SpecimenInput,
  TestDetailsInput,
  useSubmitLabReportMutation,
} from "../../generated/graphql";

import { useConditionOptionList } from "./LabReportFormUtils";
import SpecimenFormSection from "./SpecimenFormSection";
import TestDetailSection from "./TestDetailSection";
import FacilityFormSection from "./FacilityFormSection";
import ProviderFormSection from "./ProviderFormSection";
import PatientFormSection from "./PatientFormSection";

// for unique key props when handling the array
export type TestDetailsInputKeyed = TestDetailsInput & { key: string };

const LabReportForm = () => {
  const [patient, setPatient] = useState<PatientReportInput>({
    city: undefined,
    county: undefined,
    dateOfBirth: undefined,
    email: undefined,
    ethnicity: undefined,
    firstName: "",
    lastName: "",
    middleName: undefined,
    phone: undefined,
    race: undefined,
    sex: undefined,
    state: undefined,
    street: undefined,
    streetTwo: undefined,
    suffix: undefined,
    tribalAffiliation: undefined,
    zipCode: undefined,
  });
  const [provider, setProvider] = useState<ProviderReportInput>({
    city: undefined,
    county: undefined,
    email: undefined,
    firstName: "",
    lastName: "",
    middleName: undefined,
    npi: "",
    phone: undefined,
    state: undefined,
    street: undefined,
    streetTwo: undefined,
    suffix: undefined,
    zipCode: undefined,
  });
  const [facility, setFacility] = useState<FacilityReportInput>({
    city: undefined,
    clia: "",
    county: undefined,
    email: undefined,
    name: "",
    phone: undefined,
    state: undefined,
    street: undefined,
    streetTwo: undefined,
    zipCode: undefined,
  });
  const [specimen, setSpecimen] = useState<SpecimenInput>({
    snomedTypeCode: "",
    collectionDate: "",
    collectionTime: "",
    receivedDate: "",
    collectionLocationCode: "",
    collectionLocationName: "",
  });
  const [conditions, setConditions] = useState<string[]>([]);
  const [testDetailList, setTestDetailList] = useState<TestDetailsInputKeyed[]>(
    []
  );
  const [submissionResponse, setSubmissionResponse] = useState("");

  const conditionOptions = useConditionOptionList();

  const [submitLabReport] = useSubmitLabReportMutation();

  const addTestDetails = () => {
    const updatedList = [...testDetailList];
    updatedList.push({
      key: uuidv4(),
      loincCode: "",
      resultType: ResultScaleType.Ordinal,
      resultValue: "",
    } as TestDetailsInputKeyed);
    setTestDetailList(updatedList);
  };

  const removeTestDetails = (key: string) => {
    let updatedList = [...testDetailList];
    updatedList = updatedList.filter((x) => x.key !== key);
    setTestDetailList(updatedList);
  };

  const updateTestDetails = (details: TestDetailsInputKeyed) => {
    const updatedList = [...testDetailList];
    const index = testDetailList.findIndex(
      (x) => x.condition === details.condition
    );
    updatedList[index] = details;
    setTestDetailList(updatedList);
  };

  const submitForm = async () => {
    const submissionResponse = await submitLabReport({
      variables: {
        patient: { ...patient },
        provider: { ...provider },
        facility: { ...facility },
        specimen: { ...specimen },
        testDetailsList: [...testDetailList],
      },
    });
    setSubmissionResponse(
      submissionResponse.data?.submitLabReport ?? "Response was null"
    );
  };

  return (
    <div className="prime-home flex-1">
      <div className="grid-container padding-bottom-10">
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
                  onChange={(e) => setConditions(e)}
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
            <div className="grid-row grid-gap">
              <div className="grid-col-auto">
                <Button type={"button"} onClick={() => addTestDetails()}>
                  Add new test report
                </Button>
              </div>
            </div>
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
        {testDetailList.map((testDetails) => {
          return (
            <div
              className="prime-container card-container"
              key={testDetails.key}
            >
              <div className="usa-card__body">
                <TestDetailSection
                  testDetails={testDetails}
                  updateTestDetails={updateTestDetails}
                  selectedConditions={conditions}
                  selectedSpecimen={specimen.snomedTypeCode}
                  removeTest={removeTestDetails}
                />
              </div>
            </div>
          );
        })}
        <div className="padding-bottom-10">
          <Button onClick={() => submitForm()} type={"button"}>
            Submit results
          </Button>
        </div>
        {submissionResponse.length > 0 ? (
          <div className="prime-container card-container">
            <div className="usa-card__body">{submissionResponse}</div>
          </div>
        ) : undefined}
      </div>
    </div>
  );
};

export default LabReportForm;
