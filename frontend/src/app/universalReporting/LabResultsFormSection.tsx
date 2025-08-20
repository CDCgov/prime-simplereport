import React, { Dispatch } from "react";

import {
  SpecimenInput,
  TestDetailsInput,
  useGetAllLabsQuery,
} from "../../generated/graphql";

import "./universalReporting.scss";
import TestOrderFormSubsection from "./TestOrderFormSubsection";
import SpecimenFormSubsection from "./SpecimenFormSubsection";
import TestDetailFormSubsection from "./TestDetailFormSubsection";

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
  const { data: labData, loading: labDataLoading } = useGetAllLabsQuery();

  const selectedLab = labData?.labs.find(
    (l) => l.code === testDetailList[0]?.testOrderLoinc
  );

  const updateTestDetails = (modifiedTestDetails: TestDetailsInput) => {
    let unmodifiedTestDetailsList = testDetailList.filter(
      (x) => x.testPerformedLoinc !== modifiedTestDetails.testPerformedLoinc
    );
    let updatedList = [...unmodifiedTestDetailsList, modifiedTestDetails];
    setTestDetailList(updatedList);
  };

  return (
    <>
      <TestOrderFormSubsection
        testOrderLoinc={selectedLab?.code || ""}
        labData={labData}
        labDataLoading={labDataLoading}
        setSpecimen={setSpecimen}
        setTestDetailList={setTestDetailList}
      />
      <SpecimenFormSubsection
        systemCodeLoinc={selectedLab?.systemCode || ""}
        specimen={specimen}
        setSpecimen={setSpecimen}
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
