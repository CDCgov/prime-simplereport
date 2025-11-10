import React, { Dispatch } from "react";

import { TestDetailsInput } from "../../generated/graphql";

import TestDetailFormSubsection from "./TestDetailFormSubsection";

type TestDetailsFormSubsectionProps = {
  labAndSpecimenSelected: boolean;
  testDetailList: TestDetailsInput[];
  setTestDetailList: Dispatch<TestDetailsInput[]>;
};

const TestDetailsFormSubsection = ({
  labAndSpecimenSelected,
  testDetailList,
  setTestDetailList,
}: TestDetailsFormSubsectionProps) => {
  const updateTestDetails = (modifiedTestDetails: TestDetailsInput) => {
    let unmodifiedTestDetailsList = testDetailList.filter(
      (x) => x.testPerformedLoinc !== modifiedTestDetails.testPerformedLoinc
    );
    let updatedList = [...unmodifiedTestDetailsList, modifiedTestDetails];
    setTestDetailList(updatedList);
  };

  const generateResultDetailsMessage = (): string => {
    const numResults = testDetailList.length;
    let numString: string;
    let plural = true;
    if (numResults <= 0) {
      numString = "no";
    } else if (numResults === 1) {
      numString = "one";
      plural = false;
    } else if (numResults === 2) {
      numString = "two";
    } else if (numResults === 3) {
      numString = "three";
    } else {
      numString = "multiple";
    }

    return `The lab order and specimen you selected has ${numString} corresponding test result${
      plural ? "s" : ""
    } associated with it. Please fill out the test result details below.`;
  };

  return (
    <>
      <div>
        <div className="grid-col-auto">
          <h3 className={"margin-bottom-0 margin-top-5"}>
            Test result information
          </h3>
          {!labAndSpecimenSelected ? (
            <p className={"margin-bottom-0"}>
              Please select test order and specimen type above to see test
              result information
            </p>
          ) : (
            <p>{generateResultDetailsMessage()}</p>
          )}
        </div>
      </div>
      {labAndSpecimenSelected &&
        testDetailList
          .sort((a, b) =>
            a.testPerformedLoinc.localeCompare(b.testPerformedLoinc)
          )
          .map((testDetails, index) => {
            return (
              <div
                className={"margin-top-2"}
                key={testDetails.testPerformedLoinc}
              >
                <TestDetailFormSubsection
                  resultIndex={index}
                  testDetails={testDetails}
                  updateTestDetails={updateTestDetails}
                />
              </div>
            );
          })}
    </>
  );
};

export default TestDetailsFormSubsection;
