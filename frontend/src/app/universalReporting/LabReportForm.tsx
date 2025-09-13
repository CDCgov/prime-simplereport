import React, { useEffect, useState } from "react";
import {
  Button,
  StepIndicator,
  StepIndicatorStep,
} from "@trussworks/react-uswds";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import { isEmpty } from "lodash";

import {
  FacilityReportInput,
  PatientReportInput,
  ProviderReportInput,
  SpecimenInput,
  TestDetailsInput,
  useGetFacilityQuery,
  useSubmitLabReportMutation,
} from "../../generated/graphql";
import { useSelectedFacility } from "../facilitySelect/useSelectedFacility";
import { showError, showSuccess } from "../utils/srToast";

import {
  defaultFacilityReportInputState,
  defaultPatientReportInputState,
  defaultProviderReportInputState,
  defaultSpecimenReportInputState,
} from "./LabReportFormUtils";
import FacilityFormSection from "./FacilityFormSection";
import LabResultsFormSection from "./LabResultsFormSection";
import ProviderFormSection from "./ProviderFormSection";
import PatientFormSection from "./PatientFormSection";
import ReviewFormSection from "./ReviewFormSection";
import "./LabReportForm.scss";

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
  const [currentStep, setCurrentStep] = useState(0);

  const navigate = useNavigate();

  const [submitLabReport] = useSubmitLabReportMutation();

  const [activeFacility] = useSelectedFacility();
  const { data: facilityData } = useGetFacilityQuery({
    variables: {
      id: activeFacility?.id ?? "",
    },
  });

  useEffect(() => {
    if (activeFacility?.id) {
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
    }
  }, [facilityData, activeFacility]);

  const nextStep = () => {
    if (currentStep < stepperData.length) {
      setCurrentStep((prevStep) => prevStep + 1);
    }
    window.scrollTo(0, 0);
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

  const patientFieldsMissing =
    isEmpty(patient.firstName) ||
    isEmpty(patient.lastName) ||
    isEmpty(patient.dateOfBirth);

  const providerFieldsMissing =
    isEmpty(provider.firstName) ||
    isEmpty(provider.lastName) ||
    isEmpty(provider.npi);

  const facilityFieldsMissing =
    isEmpty(facility.name) || isEmpty(facility.clia);

  const specimenFieldsMissing =
    isEmpty(specimen.snomedTypeCode) ||
    isEmpty(specimen.collectionDate) ||
    isEmpty(specimen.receivedDate);

  const testDetailFieldsMissing = testDetailList.some(
    (testDetail) =>
      isEmpty(testDetail.testOrderLoinc) ||
      isEmpty(testDetail.testPerformedLoinc) ||
      isEmpty(testDetail.resultType) ||
      isEmpty(testDetail.resultValue)
  );

  // TODO: use React Hook Form once we start adding in additional validation
  const validateForm = () => {
    if (
      patientFieldsMissing ||
      providerFieldsMissing ||
      facilityFieldsMissing ||
      specimenFieldsMissing ||
      testDetailFieldsMissing
    ) {
      showError("Please fill out required fields", "Missing required fields");
      return false;
    }
    return true;
  };

  const submitForm = async () => {
    if (!validateForm()) {
      return;
    }
    try {
      const submissionResponse = await submitLabReport({
        variables: {
          patient: { ...patient },
          provider: { ...provider },
          facility: { ...facility },
          specimen: { ...specimen },
          testDetailsList: [...testDetailList],
        },
      });
      console.log(
        "Submission response: ",
        submissionResponse.data?.submitLabReport ?? "null"
      );
      showSuccess(
        "An ELR has been sent to the required public health departments",
        "Lab result successfully reported"
      );
      navigate({
        pathname: "/pilot/report",
      });
    } catch (err: any) {
      console.error(err);
      // The generic "Something went wrong" error toast appears if the submitLabReport mutation fails.
    }
  };

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
            {currentStep === 0 && <FacilityFormSection facility={facility} />}
            {currentStep === 1 && <ProviderFormSection provider={provider} />}
            {currentStep === 2 && (
              <PatientFormSection patient={patient} setPatient={setPatient} />
            )}
            {currentStep === 3 && (
              <LabResultsFormSection
                specimen={specimen}
                setSpecimen={setSpecimen}
                testDetailList={testDetailList}
                setTestDetailList={setTestDetailList}
              />
            )}
            {currentStep === 4 && (
              <ReviewFormSection
                facility={facility}
                provider={provider}
                patient={patient}
                specimen={specimen}
                testDetailsList={testDetailList}
              />
            )}
            <div className="usa-form-group report-form-controls">
              {currentStep === 4 ? (
                <Button onClick={() => submitForm()} type={"button"}>
                  Submit
                </Button>
              ) : (
                <Button
                  onClick={() => nextStep()}
                  disabled={currentStep === stepperData.length - 1}
                  type={"button"}
                  className={"margin-right-2 margin-top-3"}
                >
                  Next: {stepperData[currentStep + 1].label}
                  <FontAwesomeIcon icon={faArrowRight} className="" />
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
