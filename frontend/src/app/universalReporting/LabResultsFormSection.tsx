import React, { Dispatch, useState } from "react";
import { ComboBox } from "@trussworks/react-uswds";

import {
  Lab,
  SpecimenInput,
  TestDetailsInput,
  useGetConditionsQuery,
  useGetLabsByConditionsLazyQuery,
  useGetSpecimensByLoincLazyQuery,
} from "../../generated/graphql";

import "./universalReporting.scss";
import TestOrderFormSubsection from "./TestOrderFormSubsection";
import SpecimenFormSubsection from "./SpecimenFormSubsection";
import TestDetailFormSubsection from "./TestDetailFormSubsection";
import {
  buildConditionsOptionList,
  defaultSpecimenReportInputState,
  mapScaleDisplayToResultScaleType,
} from "./LabReportFormUtils";

type LabResultsFormSectionProps = {
  specimen: SpecimenInput;
  setSpecimen: Dispatch<SpecimenInput>;
  testDetailList: TestDetailsInput[];
  setTestDetailList: Dispatch<TestDetailsInput[]>;
};

const LabResultsFormSection = ({
  specimen,
  setSpecimen,
  testDetailList,
  setTestDetailList,
}: LabResultsFormSectionProps) => {
  const [selectedCondition, setSelectedCondition] = useState<string>("");
  const [testOrderLoinc, setTestOrderLoinc] = useState<string>("");
  const [testOrderSearchString, setTestOrderSearchString] =
    useState<string>("");

  const { data: conditionsData, loading: conditionsLoading } =
    useGetConditionsQuery();
  const [getLabsByConditions, { data: labData, loading: labDataLoading }] =
    useGetLabsByConditionsLazyQuery();
  const [
    getSpecimensByLoinc,
    { data: specimenListData, loading: specimenListLoading },
  ] = useGetSpecimensByLoincLazyQuery();

  const conditionOptions = buildConditionsOptionList(
    conditionsData?.conditions ?? []
  );

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

  const updateTestOrderLoinc = async (lab: Lab) => {
    const updatedList = [] as TestDetailsInput[];
    updatedList.push({
      condition: selectedCondition,
      testOrderLoinc: lab.code,
      testOrderDisplayName: lab.display,
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
        snomedDisplayName: sortedSpecimenData[0].snomedDisplay,
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

  return (
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
      <TestOrderFormSubsection
        hasSelectedCondition={!!selectedCondition}
        labDataLoading={labDataLoading}
        labs={labData?.labs ?? []}
        testOrderLoinc={testOrderLoinc}
        updateTestOrderLoinc={updateTestOrderLoinc}
        testOrderSearchString={testOrderSearchString}
        setTestOrderSearchString={setTestOrderSearchString}
      />
      <SpecimenFormSubsection
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
              <TestDetailFormSubsection
                testDetails={testDetails}
                updateTestDetails={updateTestDetails}
              />
            </div>
          );
        })}
    </>
  );
};

export default LabResultsFormSection;
