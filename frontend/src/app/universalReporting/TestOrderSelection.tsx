import React from "react";
import { Radio } from "@trussworks/react-uswds";

import { useFilteredTestOrderLoincListQueryStub } from "./LabReportFormUtils";

type TestOrderSelectionProps = {
  selectedConditions: String[];
  selectedSpecimen: String;
};

const TestOrderSelection = ({
  selectedConditions,
  selectedSpecimen,
}: TestOrderSelectionProps) => {
  const testOrderLoincList = useFilteredTestOrderLoincListQueryStub(
    selectedConditions,
    selectedSpecimen
  );

  return (
    <>
      {testOrderLoincList.map((loinc) => {
        return (
          <Radio
            id={`test-order-loinc-${loinc.code}`}
            name={`input-test-order-loinc-${loinc.code}`}
            label={loinc.title}
            labelDescription={loinc.description}
            tile={true}
          />
        );
      })}
    </>
  );
};

export default TestOrderSelection;
