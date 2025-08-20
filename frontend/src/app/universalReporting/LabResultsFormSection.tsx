import React, { Dispatch } from "react";

import {
  SpecimenInput,
  TestDetailsInput,
  useGetAllLabsQuery,
} from "../../generated/graphql";

import "./universalReporting.scss";
import TestOrderFormSubsection from "./TestOrderFormSubsection";
import SpecimenFormSubsection from "./SpecimenFormSubsection";
import TestDetailsFormSubsection from "./TestDetailsFormSubsection";

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
      <TestDetailsFormSubsection
        labAndSpecimenSelected={
          selectedLab !== undefined && specimen.snomedTypeCode !== ""
        }
        testDetailList={testDetailList}
        setTestDetailList={setTestDetailList}
      />
    </>
  );
};

export default LabResultsFormSection;
