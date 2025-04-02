import React, { useEffect, useState } from "react";
import { Button, Radio } from "@trussworks/react-uswds";

import MultiSelect from "../commonComponents/MultiSelect/MultiSelect";
import {
  FacilityReportInput,
  PatientReportInput,
  ProviderReportInput,
  SpecimenInput,
  TestDetailsInput,
  useGetConditionsQuery,
  useGetFacilityQuery,
  useSubmitLabReportMutation,
} from "../../generated/graphql";
import SearchInput from "../testQueue/addToQueue/SearchInput";
import { useSelectedFacility } from "../facilitySelect/useSelectedFacility";

import {
  buildConditionsOptionList,
  TestOrderLoinc,
  useFilteredTestOrderLoincListQueryStub,
} from "./LabReportFormUtils";
import SpecimenFormSection from "./SpecimenFormSection";
import TestDetailSection from "./TestDetailSection";
import FacilityFormSection from "./FacilityFormSection";
import ProviderFormSection from "./ProviderFormSection";
import PatientFormSection from "./PatientFormSection";

const LabReportForm = () => {
  const [patient, setPatient] = useState<PatientReportInput>({
    city: "",
    country: "USA",
    county: "",
    dateOfBirth: "",
    email: "",
    ethnicity: "",
    firstName: "",
    lastName: "",
    middleName: "",
    phone: "",
    race: "",
    sex: "",
    state: "",
    street: "",
    streetTwo: "",
    suffix: "",
    tribalAffiliation: "",
    zipCode: "",
  });
  const [provider, setProvider] = useState<ProviderReportInput>({
    city: "",
    county: "",
    email: "",
    firstName: "",
    lastName: "",
    middleName: "",
    npi: "",
    phone: "",
    state: "",
    street: "",
    streetTwo: "",
    suffix: "",
    zipCode: "",
    country: "USA",
  });
  const [facility, setFacility] = useState<FacilityReportInput>({
    city: "",
    clia: "",
    county: "",
    email: "",
    name: "",
    phone: "",
    state: "",
    street: "",
    streetTwo: "",
    zipCode: "",
    country: "USA",
  });
  const [specimen, setSpecimen] = useState<SpecimenInput>({
    snomedTypeCode: "",
    collectionDate: "",
    receivedDate: "",
    collectionLocationCode: "",
    collectionLocationName: "",
  });
  const [conditions, setConditions] = useState<string[]>([]);
  const [searchQueryTestOrder, setSearchQueryTestOrder] = useState<string>("");
  const [testOrderLoinc, setTestOrderLoinc] = useState<string>("");
  const [testDetailList, setTestDetailList] = useState<TestDetailsInput[]>([]);
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

  useEffect(() => {
    setProvider({
      ...provider,
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
    });
    setFacility({
      ...facility,
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
    });
  }, [facilityData]);

  const conditionOptions = buildConditionsOptionList(
    conditionsData?.conditions ?? []
  );

  const testOrderLoincList = useFilteredTestOrderLoincListQueryStub();

  const updateTestOrderLoinc = (loinc: TestOrderLoinc) => {
    const updatedList = [] as TestDetailsInput[];
    loinc.performedTests.forEach((value) => {
      updatedList.push({
        testOrderLoinc: loinc.code,
        testPerformedLoinc: value.code,
        testPerformedLoincShortName: value.shortName,
        resultType: value.resultType.toUpperCase(),
        resultValue: "",
        resultDate: "",
      } as TestDetailsInput);
    });
    setTestDetailList(updatedList);
    setTestOrderLoinc(loinc.code);
  };

  const updateTestDetails = (details: TestDetailsInput) => {
    let updatedList = [...testDetailList];
    updatedList = updatedList.filter(
      (x) => x.testPerformedLoinc !== details.testPerformedLoinc
    );
    updatedList = [...updatedList, details];
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

  const filteredTestOrderLoincList = testOrderLoincList.filter(
    (x) =>
      x.title.toLowerCase().includes(searchQueryTestOrder.toLowerCase()) ||
      x.description.toLowerCase().includes(searchQueryTestOrder.toLowerCase())
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
                )}
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
        <div className="prime-container card-container">
          <div className="usa-card__body">
            <div className="grid-row">
              <div className="grid-col-auto">
                <h2 className={"font-sans-lg"}>Test Order</h2>
              </div>
            </div>
            <div className="grid-row grid-gap">
              <div className="grid-col-10">
                <fieldset className={"usa-fieldset"}>
                  <div className="grid-row flex-justify">
                    <div className="grid-col-auto">
                      <legend className="usa-legend margin-top-1">
                        Select the test ordered below
                      </legend>
                    </div>
                    <div className="grid-col-5">
                      <SearchInput
                        onInputChange={(e) =>
                          setSearchQueryTestOrder(e.target.value)
                        }
                        queryString={searchQueryTestOrder}
                        placeholder={`Filter test orders`}
                        showSubmitButton={false}
                      />
                    </div>
                  </div>
                  {filteredTestOrderLoincList.map((loinc) => {
                    return (
                      <Radio
                        id={`test-order-loinc-${loinc.code}`}
                        key={loinc.code}
                        name={`input-test-order-loinc`}
                        label={loinc.title}
                        labelDescription={loinc.description}
                        value={loinc.code}
                        checked={loinc.code === testOrderLoinc}
                        onChange={() => updateTestOrderLoinc(loinc)}
                        tile={true}
                      />
                    );
                  })}
                  {filteredTestOrderLoincList.length === 0 ? (
                    <>
                      <div className="grid-row grid-gap">
                        <div className="grid-col-auto padding-y-6">
                          No results found.
                        </div>
                      </div>
                    </>
                  ) : undefined}
                </fieldset>
              </div>
            </div>
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
