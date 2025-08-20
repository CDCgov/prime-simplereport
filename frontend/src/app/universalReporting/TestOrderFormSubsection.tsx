import { ComboBox } from "@trussworks/react-uswds";
import React, { Dispatch } from "react";

import {
  GetAllLabsQuery,
  SpecimenInput,
  TestDetailsInput,
} from "../../generated/graphql";

import {
  buildLabDataOptionList,
  defaultSpecimenReportInputState,
  mapScaleDisplayToResultScaleType,
} from "./LabReportFormUtils";

type TestOrderFormSectionProps = {
  testOrderLoinc: string;
  labData: GetAllLabsQuery | undefined;
  labDataLoading: boolean;
  setSpecimen: Dispatch<SpecimenInput>;
  setTestDetailList: Dispatch<TestDetailsInput[]>;
};

const TestOrderFormSubsection = ({
  testOrderLoinc,
  labData,
  labDataLoading,
  setSpecimen,
  setTestDetailList,
}: TestOrderFormSectionProps) => {
  const labs = labData?.labs ?? [];
  const labOptions = buildLabDataOptionList(labs ?? []);

  const updateTestOrder = (val: string | undefined) => {
    if (val) {
      const foundLab = labs.find((l) => l.code === val);

      if (foundLab) {
        setSpecimen(defaultSpecimenReportInputState);

        const updatedList = [] as TestDetailsInput[];
        updatedList.push({
          //todo: make a new data type for test details without condition?
          testOrderLoinc: foundLab.code,
          testOrderDisplayName: foundLab.display,
          testPerformedLoinc: foundLab.code,
          testPerformedLoincLongCommonName: foundLab.longCommonName,
          resultType: mapScaleDisplayToResultScaleType(
            foundLab.scaleDisplay ?? ""
          ),
          resultValue: "",
          resultDate: "",
          resultInterpretation: "",
        } as TestDetailsInput);
        setTestDetailList(updatedList);
      } else {
        // Selection is somehow not in the labs list - do not update
        console.error("Selected test order does not exist");
      }
    } else {
      // Selection cleared - reset form to default state
      setSpecimen(defaultSpecimenReportInputState);
      setTestDetailList([]);
    }
  };

  return (
    <>
      <div className="grid-row">
        <div className="grid-col-auto">
          <h2 className={"font-sans-lg"}>Test order information</h2>
          <p>Choose a test order to select specimen type</p>
        </div>
      </div>
      <div className="grid-row grid-gap">
        <div className="grid-col-10">
          {labDataLoading && <div>Loading test orders...</div>}
          {!labDataLoading && labs.length === 0 && (
            <div>
              No test orders found. Please contact support for assistance.
            </div>
          )}
          {!labDataLoading && (
            <>
              <label className="usa-legend margin-top-0" htmlFor="selected-lab">
                Test order
              </label>
              <ComboBox
                id="selected-lab"
                name="selected-lab"
                options={labOptions}
                onChange={(val) => {
                  if (val !== testOrderLoinc) {
                    updateTestOrder(val);
                  }
                }}
                defaultValue={testOrderLoinc}
                aria-required={true}
                className={"lab-combo-box"}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default TestOrderFormSubsection;
