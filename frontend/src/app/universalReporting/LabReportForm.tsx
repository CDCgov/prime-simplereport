import React, { useEffect, useState } from "react";
import {
  Button,
  ComboBox,
  StepIndicator,
  StepIndicatorStep,
} from "@trussworks/react-uswds";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
import "./LabReportForm.scss";

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
import ReviewFormSection from "./ReviewFormSection";

const stepperData = [
  {
    label: "Facility information",
  },
  {
    label: "Provider information",
  },
  {
    label: "Patient information",
  },
  {
    label: "Lab results",
  },
  {
    label: "Review and submit",
  },
];

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
  const [selectedCondition, setSelectedCondition] = useState<string>("");
  const [testOrderLoinc, setTestOrderLoinc] = useState<string>("");
  const [testOrderSearchString, setTestOrderSearchString] =
    useState<string>("");
  const [submissionResponse, setSubmissionResponse] = useState("");
  const [currentStep, setCurrentStep] = useState(0);

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
    const facilityInfo = facilityData?.facility;
    const facilityAddress = facilityInfo?.address ?? {};
    const orderingProvider = facilityInfo?.orderingProvider ?? {};
    const providerAddress = orderingProvider?.address ?? {};

    setProvider((prevProvider) => ({
      ...prevProvider,
      city: providerAddress.city ?? "",
      county: providerAddress.county ?? "",
      state: providerAddress.state ?? "",
      street: providerAddress.streetOne ?? "",
      streetTwo: providerAddress.streetTwo ?? "",
      zipCode: providerAddress.postalCode ?? "",
      firstName: orderingProvider.firstName ?? "",
      lastName: orderingProvider.lastName ?? "",
      middleName: orderingProvider.middleName ?? "",
      npi: orderingProvider.NPI ?? "",
      phone: orderingProvider.phone ?? "",
      suffix: orderingProvider.suffix ?? "",
    }));

    setFacility((prevFacility) => ({
      ...prevFacility,
      city: facilityAddress?.city ?? "",
      state: facilityAddress?.state ?? "",
      street: facilityAddress?.streetOne ?? "",
      streetTwo: facilityAddress?.streetTwo ?? "",
      zipCode: facilityAddress?.postalCode ?? "",
      county: facilityAddress?.county ?? "",
      clia: facilityInfo?.cliaNumber ?? "",
      email: facilityInfo?.email ?? "",
      name: facilityInfo?.name ?? "",
      phone: facilityInfo?.phone ?? "",
    }));
  }, [facilityData]);

  const updateTestOrderLoinc = async (lab: Lab) => {
    const updatedList = [] as TestDetailsInput[];
    updatedList.push({
      condition: selectedCondition,
      testOrderLoinc: lab.code,
      testPerformedLoinc: lab.code,
      testPerformedLoincLongCommonName: lab.longCommonName,
      resultType: mapScaleDisplayToResultScaleType(lab.scaleDisplay ?? ""),
      resultValue: "",
      resultDate: "",
      resultInterpretation: "",
    } as TestDetailsInput);
    setTestDetailList(updatedList);
    setTestOrderLoinc(lab.code);

    if (lab.systemCode) {
      const response = await getSpecimensByLoinc({
        variables: {
          loinc: lab.systemCode,
        },
      });
      const specimenData = response.data?.specimens ?? [];
      const sortedSpecimenData = specimenData.toSorted((a, b) =>
        a.snomedDisplay.localeCompare(b.snomedDisplay)
      );
      const sortedBodySiteList =
        sortedSpecimenData[0].bodySiteList?.toSorted((a, b) =>
          a.snomedSiteDisplay.localeCompare(b.snomedSiteDisplay)
        ) ?? [];

      setSpecimen({
        ...specimen,
        snomedTypeCode: sortedSpecimenData[0].snomedCode,
        collectionBodySiteCode: sortedBodySiteList[0]?.snomedSiteCode ?? "",
        collectionBodySiteName: sortedBodySiteList[0]?.snomedSiteDisplay ?? "",
      } as SpecimenInput);
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

  const updateCondition = async (selectedCondition: string) => {
    setSelectedCondition(selectedCondition);

    if (selectedCondition) {
      // until we implement multiplex testing, for now we are restricting the frontend to handling one condition at a time
      // even though the backend query can still support retrieving labs by multiple condition codes
      await getLabsByConditions({
        variables: {
          conditionCodes: [selectedCondition],
        },
      });
    } else {
      setTestDetailList([]);
      setTestOrderLoinc("");
      setTestOrderSearchString("");
      setSpecimen(defaultSpecimenReportInputState);
    }
  };

  const nextStep = () => {
    if (currentStep < stepperData.length) {
      setCurrentStep((prevStep) => prevStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prevStep) => prevStep - 1);
    }
  };

  const setStep = (step: number) => {
    if (step >= 0 && step < stepperData.length) {
      setCurrentStep(step);
    }
  };

  const getStepStatus = (step: number) => {
    if (step < currentStep) return "complete";
    if (step === currentStep) return "current";
    return "incomplete";
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
      <div className="grid-container padding-bottom-10 padding-top-4">
        <StepIndicator headingLevel={"h4"} ofText={"of"} stepText={"Step"}>
          {stepperData.map((step, index) => (
            <StepIndicatorStep
              key={stepperData[index].label}
              label={stepperData[index].label}
              status={getStepStatus(index)}
              onClick={() => setStep(index)}
            />
          ))}
        </StepIndicator>
        {currentStep !== 0 && (
          <Button
            onClick={() => prevStep()}
            type={"button"}
            className={"margin-right-2 margin-bottom-3"}
            unstyled={true}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="margin-left-1" />
            Back to {stepperData[currentStep - 1].label.toLowerCase()}
          </Button>
        )}
        <div className="prime-container card-container">
          <div className="usa-card__body">
            {currentStep === 0 && (
              <FacilityFormSection
                facility={facility}
                setFacility={setFacility}
              />
            )}
            {currentStep === 1 && (
              <ProviderFormSection
                provider={provider}
                setProvider={setProvider}
              />
            )}
            {currentStep === 2 && (
              <PatientFormSection patient={patient} setPatient={setPatient} />
            )}
            {currentStep === 3 && (
              <>
                <div className="grid-row grid-gap">
                  <div className="grid-col-auto">
                    <h2 className={"font-sans-lg"}>Condition Tested</h2>
                  </div>
                </div>
                <div className="grid-row margin-bottom-2">
                  <div className="grid-col-10">
                    {conditionsLoading ? (
                      <div>Loading condition list...</div>
                    ) : (
                      <>
                        <label
                          className="usa-legend margin-top-0"
                          htmlFor="selected-condition"
                        >
                          Condition to report
                        </label>
                        <ComboBox
                          id="selected-condition"
                          name="selected-condition"
                          options={conditionOptions}
                          onChange={(e) => updateCondition(e ?? "")}
                          defaultValue={selectedCondition}
                          aria-required={true}
                          className={"condition-combo-box"}
                        />
                      </>
                    )}
                  </div>
                </div>
                <TestOrderFormSection
                  hasSelectedCondition={!!selectedCondition}
                  labDataLoading={labDataLoading}
                  labs={labData?.labs ?? []}
                  testOrderLoinc={testOrderLoinc}
                  updateTestOrderLoinc={updateTestOrderLoinc}
                  testOrderSearchString={testOrderSearchString}
                  setTestOrderSearchString={setTestOrderSearchString}
                />
                <SpecimenFormSection
                  specimen={specimen}
                  setSpecimen={setSpecimen}
                  loading={specimenListLoading}
                  isTestOrderSelected={testOrderLoinc.length > 0}
                  specimenList={specimenListData?.specimens ?? []}
                />
                {testDetailList
                  .sort((a, b) =>
                    a.testPerformedLoinc.localeCompare(b.testPerformedLoinc)
                  )
                  .map((testDetails) => {
                    return (
                      <div
                        className={"margin-top-2"}
                        key={testDetails.testPerformedLoinc}
                      >
                        <TestDetailSection
                          testDetails={testDetails}
                          updateTestDetails={updateTestDetails}
                        />
                      </div>
                    );
                  })}
              </>
            )}
            {currentStep === 4 && (
              <>
                <ReviewFormSection facility={facility} />
                {submissionResponse.length > 0 && (
                  <div>Submission response: {submissionResponse}</div>
                )}
              </>
            )}
            <div className="usa-form-group">
              {currentStep === 4 ? (
                <Button onClick={() => submitForm()} type={"button"}>
                  Submit results
                </Button>
              ) : (
                <Button
                  onClick={() => nextStep()}
                  disabled={currentStep === stepperData.length - 1}
                  type={"button"}
                  className={"margin-right-2"}
                >
                  Next: {stepperData[currentStep + 1].label}
                  <FontAwesomeIcon
                    icon={faArrowRight}
                    className="margin-left-1"
                  />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabReportForm;
