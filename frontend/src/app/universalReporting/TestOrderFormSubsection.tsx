import { ComboBox } from "@trussworks/react-uswds";
import React from "react";

import { Lab, useGetAllLabsQuery } from "../../generated/graphql";

import { buildLabDataOptionList } from "./LabReportFormUtils";

type TestOrderFormSectionProps = {
  testOrderLoinc: string;
  updateTestOrderLoinc: (lab: Lab | undefined) => void;
};

const TestOrderFormSubsection = ({
  testOrderLoinc,
  updateTestOrderLoinc,
}: TestOrderFormSectionProps) => {
  const { data: labData, loading: labDataLoading } = useGetAllLabsQuery();

  const labs = labData?.labs ?? [];
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
                onChange={(e) => {
                  const l = labs.find((l) => l.code === e);
                  updateTestOrderLoinc(l);
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
