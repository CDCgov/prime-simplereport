import React, { Dispatch, useState } from "react";

import {
  Lab,
  SpecimenInput,
  TestDetailsInput,
  useGetSpecimensByLoincLazyQuery,
} from "../../generated/graphql";

import "./universalReporting.scss";
import TestOrderFormSubsection from "./TestOrderFormSubsection";
import SpecimenFormSubsection from "./SpecimenFormSubsection";
import TestDetailFormSubsection from "./TestDetailFormSubsection";
import {
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
  const [testOrderLoinc, setTestOrderLoinc] = useState<string>("");

  const [
    getSpecimensByLoinc,
    { data: specimenListData, loading: specimenListLoading },
  ] = useGetSpecimensByLoincLazyQuery();

  const updateTestOrderLoinc = async (lab: Lab | undefined) => {
    if (lab) {
      const updatedList = [] as TestDetailsInput[];
      updatedList.push({
        //todo: can we leave condition blank or should I make a new type or should I populate it in the backend even though we don't use it for HL7 messages?
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
          collectionBodySiteName:
            sortedBodySiteList[0]?.snomedSiteDisplay ?? "",
        } as SpecimenInput);
      } else {
        // currently filtering out labs with no system code on the backend
        console.error("No LOINC system code to look up specimen.");
      }
    } else {
      setTestOrderLoinc("");
      setTestDetailList([]);
      setSpecimen(defaultSpecimenReportInputState);
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
      <TestOrderFormSubsection
        testOrderLoinc={testOrderLoinc}
        updateTestOrderLoinc={updateTestOrderLoinc}
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
