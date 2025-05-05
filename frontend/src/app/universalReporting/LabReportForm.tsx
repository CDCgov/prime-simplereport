import React, { useEffect, useState } from "react";
import { Button } from "@trussworks/react-uswds";

import { useMergeReducer } from "../utils/hooks";
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

interface FormState {
  patient: PatientReportInput;
  provider: ProviderReportInput;
  facility: FacilityReportInput;
  specimen: SpecimenInput;
  testDetailList: TestDetailsInput[];
}

const initialFormState = {
  patient: defaultPatientReportInputState,
  provider: defaultProviderReportInputState,
  facility: defaultFacilityReportInputState,
  specimen: defaultSpecimenReportInputState,
  testDetailList: [],
};

const LabReportForm = () => {
  const [state, dispatch] = useMergeReducer<FormState>(initialFormState);

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
    const facilityInfo = facilityData?.facility;
    const facilityAddress = facilityInfo?.address ?? {};
    const orderingProvider = facilityInfo?.orderingProvider ?? {};
    const providerAddress = orderingProvider?.address ?? {};

    dispatch({
      provider: {
        city: providerAddress.city,
        county: providerAddress.county,
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
      },
      facility: {
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
        country: "USA",
      },
    });
  }, [facilityData, dispatch]);

  const updateTestOrderLoinc = async (lab: Lab) => {
    const updatedList = [] as TestDetailsInput[];
    updatedList.push({
      testOrderLoinc: lab.code,
      testPerformedLoinc: lab.code,
      testPerformedLoincLongCommonName: lab.longCommonName,
      resultType: mapScaleDisplayToResultScaleType(lab.scaleDisplay ?? ""),
      resultValue: "",
      resultDate: "",
      resultInterpretation: "",
    } as TestDetailsInput);

    dispatch({
      testDetailList: updatedList,
    });

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
      const sortedBodySiteList = sortedSpecimenData[0].bodySiteList?.toSorted(
        (a, b) => a.snomedSiteDisplay.localeCompare(b.snomedSiteDisplay)
      );

      dispatch({
        specimen: {
          snomedTypeCode: sortedSpecimenData[0].snomedCode,
          collectionLocationCode: sortedBodySiteList[0].snomedSiteCode ?? "",
          collectionLocationName: sortedBodySiteList[0].snomedSiteDisplay ?? "",
        },
      });
    } else {
      // currently filtering out labs with no system code on the backend
      console.error("No LOINC system code to look up specimen.");
    }
  };

  const updateTestDetails = (details: TestDetailsInput) => {
    let updatedList = [...state.testDetailList];
    updatedList = updatedList.filter(
      (x) => x.testPerformedLoinc !== details.testPerformedLoinc
    );
    updatedList = [...updatedList, details];
    dispatch({ testDetailList: updatedList });
  };

  const updateConditions = async (selectedConditions: string[]) => {
    setSelectedConditions(selectedConditions);

    if (selectedConditions.length === 0) {
      dispatch({
        testDetailList: [],
        specimen: defaultSpecimenReportInputState,
      });
      setTestOrderLoinc("");
      setTestOrderSearchString("");
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
        patient: { ...state.patient },
        provider: { ...state.provider },
        facility: { ...state.facility },
        specimen: { ...state.specimen },
        testDetailsList: [...state.testDetailList],
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
            <PatientFormSection
              patient={state.patient}
              setPatient={(patient: PatientReportInput) =>
                dispatch({ patient })
              }
            />
          </div>
        </div>
        <div className="prime-container card-container">
          <div className="usa-card__body">
            <ProviderFormSection
              provider={state.provider}
              setProvider={(provider: ProviderReportInput) =>
                dispatch({ provider })
              }
            />
          </div>
        </div>
        <div className="prime-container card-container">
          <div className="usa-card__body">
            <FacilityFormSection
              facility={state.facility}
              setFacility={(facility: FacilityReportInput) =>
                dispatch({ facility })
              }
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
              specimen={state.specimen}
              setSpecimen={(specimen: SpecimenInput) => dispatch({ specimen })}
              loading={specimenListLoading}
              isTestOrderSelected={testOrderLoinc.length > 0}
              specimenList={specimenListData?.specimens ?? []}
            />
          </div>
        </div>
        {state.testDetailList
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
