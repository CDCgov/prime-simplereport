import React, { useEffect, useState } from "react";
import { Button } from "@trussworks/react-uswds";

import MultiSelect from "../commonComponents/MultiSelect/MultiSelect";
import {
  FacilityReportInput,
  Lab,
  PatientReportInput,
  ProviderReportInput,
  SpecimenInput,
  TestDetailsInput,
  useGetConditionsQuery,
  useGetFacilityQuery,
  useGetLabsByConditionsLazyQuery,
  useGetSpecimensByLoincLazyQuery,
  useSubmitLabReportMutation,
} from "../../generated/graphql";
import { useSelectedFacility } from "../facilitySelect/useSelectedFacility";

import {
  buildConditionsOptionList,
  defaultFacilityReportInputState,
  defaultPatientReportInputState,
  defaultProviderReportInputState,
  defaultSpecimenReportInputState,
  mapScaleDisplayToResultScaleType,
} from "./LabReportFormUtils";
import SpecimenFormSection from "./SpecimenFormSection";
import TestDetailSection from "./TestDetailSection";
import FacilityFormSection from "./FacilityFormSection";
import ProviderFormSection from "./ProviderFormSection";
import PatientFormSection from "./PatientFormSection";
import TestOrderFormSection from "./TestOrderFormSection";

const LabReportForm = () => {
  const [patient, setPatient] = useState<PatientReportInput>(
    defaultPatientReportInputState
  );
  const [provider, setProvider] = useState<ProviderReportInput>(
    defaultProviderReportInputState
  );
  const [facility, setFacility] = useState<FacilityReportInput>(
    defaultFacilityReportInputState
  );
  const [specimen, setSpecimen] = useState<SpecimenInput>(
    defaultSpecimenReportInputState
  );
  const [testDetailList, setTestDetailList] = useState<TestDetailsInput[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [testOrderLoinc, setTestOrderLoinc] = useState<string>("");
  const [testOrderSearchString, setTestOrderSearchString] =
    useState<string>("");
  const [submissionResponse, setSubmissionResponse] = useState("");

  const [submitLabReport] = useSubmitLabReportMutation();

  const [activeFacility] = useSelectedFacility();
  const { data: facilityData } = useGetFacilityQuery({
    variables: {
      id: activeFacility?.id ?? "",
    },
  });

  const { data: conditionsData, loading: conditionsLoading } =
    useGetConditionsQuery();

  const [
    getSpecimensByLoinc,
    { data: specimenListData, loading: specimenListLoading },
  ] = useGetSpecimensByLoincLazyQuery();
  const [getLabsByConditions, { data: labData, loading: labDataLoading }] =
    useGetLabsByConditionsLazyQuery();

  useEffect(() => {
    setProvider((prevProvider) => {
      return {
        ...prevProvider,
        city: facilityData?.facility?.orderingProvider?.address?.city,
        county: facilityData?.facility?.orderingProvider?.address?.county,
        firstName: facilityData?.facility?.orderingProvider?.firstName ?? "",
        lastName: facilityData?.facility?.orderingProvider?.lastName ?? "",
        middleName: facilityData?.facility?.orderingProvider?.middleName ?? "",
        npi: facilityData?.facility?.orderingProvider?.NPI ?? "",
        phone: facilityData?.facility?.orderingProvider?.phone ?? "",
        state: facilityData?.facility?.orderingProvider?.address?.state ?? "",
        street:
          facilityData?.facility?.orderingProvider?.address?.streetOne ?? "",
        streetTwo:
          facilityData?.facility?.orderingProvider?.address?.streetTwo ?? "",
        suffix: facilityData?.facility?.orderingProvider?.suffix ?? "",
        zipCode:
          facilityData?.facility?.orderingProvider?.address?.postalCode ?? "",
      };
    });
    setFacility((prevFacility) => {
      return {
        ...prevFacility,
        city: facilityData?.facility?.address?.city ?? "",
        clia: facilityData?.facility?.cliaNumber ?? "",
        county: facilityData?.facility?.address?.county ?? "",
        email: facilityData?.facility?.email ?? "",
        name: facilityData?.facility?.name ?? "",
        phone: facilityData?.facility?.phone ?? "",
        state: facilityData?.facility?.address?.state ?? "",
        street: facilityData?.facility?.address?.streetOne ?? "",
        streetTwo: facilityData?.facility?.address?.streetTwo ?? "",
        zipCode: facilityData?.facility?.address?.postalCode ?? "",
        country: "USA",
      };
    });
  }, [facilityData]);

  const updateTestOrderLoinc = async (lab: Lab) => {
    const updatedList = [] as TestDetailsInput[];
    updatedList.push({
      testOrderLoinc: lab.code,
      testPerformedLoinc: lab.code,
      testPerformedLoincShortName: lab.longCommonName,
      resultType: mapScaleDisplayToResultScaleType(lab.scaleDisplay ?? ""),
      resultValue: "",
      resultDate: "",
      resultInterpretation: "",
    } as TestDetailsInput);
    setTestDetailList(updatedList);
    setTestOrderLoinc(lab.code);

    if (lab.systemCode) {
      await getSpecimensByLoinc({
        variables: {
          loinc: lab.systemCode,
        },
      });
    } else {
      // currently filtering out labs with no system code on the backend
      console.error("No LOINC system code to look up specimen.");
    }
  };

  const updateTestDetails = (details: TestDetailsInput) => {
    let updatedList = [...testDetailList];
    updatedList = updatedList.filter(
      (x) => x.testPerformedLoinc !== details.testPerformedLoinc
    );
    updatedList = [...updatedList, details];
    setTestDetailList(updatedList);
  };

  const updateConditions = async (selectedConditions: string[]) => {
    setSelectedConditions(selectedConditions);

    if (selectedConditions.length === 0) {
      setTestDetailList([]);
      setTestOrderLoinc("");
      setTestOrderSearchString("");
      setSpecimen(defaultSpecimenReportInputState);
    }

    if (selectedConditions.length > 0) {
      await getLabsByConditions({
        variables: {
          conditionCodes: selectedConditions,
        },
      });
    }
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

  const conditionOptions = buildConditionsOptionList(
    conditionsData?.conditions ?? []
  );

  return (
    <div className="prime-home flex-1">
      <div className="grid-container padding-bottom-10">
        <div className="prime-container card-container">
          <div className="usa-card__header">
            <h1 className={"font-sans-lg"}>Universal Lab Reporting Form</h1>
          </div>
          <div className="usa-card__body">
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
                <h2 className={"font-sans-lg"}>Conditions Tested</h2>
              </div>
            </div>
            <div className="grid-row margin-bottom-5">
              <div className="grid-col-8">
                {conditionsLoading ? (
                  <div>Loading condition list...</div>
                ) : (
                  <MultiSelect
                    name={"selected-conditions"}
                    options={conditionOptions}
                    onChange={(e) => updateConditions(e)}
                    initialSelectedValues={selectedConditions}
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
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="prime-container card-container">
          <div className="usa-card__body">
            <TestOrderFormSection
              hasSelectedCondition={selectedConditions.length > 0}
              labDataLoading={labDataLoading}
              labs={labData?.labs ?? []}
              testOrderLoinc={testOrderLoinc}
              updateTestOrderLoinc={updateTestOrderLoinc}
              testOrderSearchString={testOrderSearchString}
              setTestOrderSearchString={setTestOrderSearchString}
            />
          </div>
        </div>
        <div className="prime-container card-container">
          <div className="usa-card__body">
            <SpecimenFormSection
              specimen={specimen}
              setSpecimen={setSpecimen}
              loading={specimenListLoading}
              isTestOrderSelected={testOrderLoinc.length > 0}
              specimenList={specimenListData?.specimens ?? []}
            />
          </div>
        </div>
        {testDetailList
          .sort((a, b) =>
            a.testPerformedLoinc.localeCompare(b.testPerformedLoinc)
          )
          .map((testDetails) => {
            return (
              <div
                className="prime-container card-container"
                key={testDetails.testPerformedLoinc}
              >
                <div className="usa-card__body">
                  <TestDetailSection
                    testDetails={testDetails}
                    updateTestDetails={updateTestDetails}
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
        {submissionResponse.length > 0 && (
          <div className="prime-container card-container">
            <div className="usa-card__body">{submissionResponse}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LabReportForm;
