import { ComboBox } from "@trussworks/react-uswds";
import React from "react";

import { Lab } from "../../generated/graphql";

import { buildLabDataOptionList } from "./LabReportFormUtils";

type TestOrderFormSectionProps = {
  hasSelectedCondition: boolean;
  labDataLoading: boolean;
  labs: Lab[];
  testOrderLoinc: string;
  updateTestOrderLoinc: (lab: Lab | undefined) => void;
};

const TestOrderFormSubsection = ({
  hasSelectedCondition,
  labDataLoading,
  labs,
  testOrderLoinc,
  updateTestOrderLoinc,
}: TestOrderFormSectionProps) => {
  const labOptions = buildLabDataOptionList(labs ?? []);

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
          {!hasSelectedCondition && (
            <div>Please select a condition before selecting a test order.</div>
          )}
          {hasSelectedCondition && labDataLoading && (
            <div>Loading test orders from selected condition...</div>
          )}
          {hasSelectedCondition && !labDataLoading && labs.length === 0 && (
            <div>
              No test orders found for selected condition. Please contact
              support for assistance.
            </div>
          )}
          {hasSelectedCondition && !labDataLoading && (
            <>
              <label className="usa-legend margin-top-0" htmlFor="selected-lab">
                Test order
              </label>
              <ComboBox
                id="selected-lab"
                name="selected-lab"
                options={labOptions}
                onChange={(e) => {
                  const l = labs.find((l) => l.code === e);
                  updateTestOrderLoinc(l);
                }}
                defaultValue={testOrderLoinc}
                aria-required={true}
                className={"condition-combo-box"}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default TestOrderFormSubsection;
