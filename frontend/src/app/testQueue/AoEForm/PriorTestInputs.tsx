import React from "react";
import { useState } from "react";
import { COVID_RESULTS, TEST_RESULT_DESCRIPTIONS } from "../../constants";
import RadioGroup from "../../commonComponents/RadioGroup";
import Dropdown, { Option } from "../../commonComponents/Dropdown";
import TextInput from "../../commonComponents/TextInput";
import Optional from "../../commonComponents/Optional";
import moment from "moment";

interface Props {
  testTypeConfig: Option[];
  isFirstTest: boolean | undefined;
  setIsFirstTest: (isFirstTest: boolean) => void;
  priorTestDate: string | undefined;
  setPriorTestDate: (priorTestDate: string | undefined) => void;
  priorTestResult: string | undefined;
  setPriorTestResult: (priorTestResult: string | undefined) => void;
  priorTestType: string | undefined;
  setPriorTestType: (priorTestType: string | undefined) => void;
  lastTest:
    | {
        dateTested: string;
        result: string;
      }
    | undefined;
}

const PriorTestInputs: React.FC<Props> = ({
  testTypeConfig,
  isFirstTest,
  setIsFirstTest,
  priorTestDate,
  setPriorTestDate,
  priorTestResult,
  setPriorTestResult,
  priorTestType,
  setPriorTestType,
  lastTest,
}) => {
  const recentDate = (lastTest?.dateTested || "").split("T")[0];
  const filledPriorTest =
    priorTestDate &&
    recentDate === priorTestDate &&
    lastTest &&
    lastTest.result === priorTestResult;
  const [lastTestAnswer, setlastTestAnswer] = useState(
    !priorTestDate || isFirstTest === undefined
      ? undefined
      : filledPriorTest
      ? "yes"
      : "no"
  );
  const previousTestEntry = (
    <>
      <TextInput
        type="date"
        label="Date of Most Recent Test"
        name="prior_test_date"
        value={priorTestDate}
        onChange={(e) => setPriorTestDate(e.target.value)}
        max={new Date().toISOString().split("T")[0]}
        min="2020-02-01"
      />
      <Dropdown
        options={testTypeConfig}
        label="Type of Prior Test"
        name="prior_test_type"
        selectedValue={priorTestType || ""}
        onChange={(e) => setPriorTestType(e.target.value)}
        defaultSelect
      />
      <Dropdown
        options={[
          {
            value: COVID_RESULTS.POSITIVE,
            label: TEST_RESULT_DESCRIPTIONS.POSITIVE,
          },
          {
            value: COVID_RESULTS.NEGATIVE,
            label: TEST_RESULT_DESCRIPTIONS.NEGATIVE,
          },
          {
            value: COVID_RESULTS.INCONCLUSIVE,
            label: TEST_RESULT_DESCRIPTIONS.UNDETERMINED,
          },
        ]}
        label="Result of Prior Test"
        name="prior_test_result"
        selectedValue={priorTestResult || ""}
        defaultSelect
        onChange={(e) => setPriorTestResult(e.target.value)}
      />
    </>
  );

  // If lastTest matches priorTest, offer to fill it
  if (lastTest) {
    // Suggest a prior test
    // TODO: ARIA/508 compliance
    const legendIsh = (
      <>
        <div className="margin-top-2">
          <b>Was this your most recent COVID-19 test?</b>
          <Optional />
        </div>
        <p className="prime-previous-test-display margin-top-2 margin-bottom-0 line-height-sans-5">
          <b>Date: </b>
          {moment(lastTest.dateTested).format("LLLL")}
          <br />
          <b>Type: </b>
          Antigen
          <br />
          <b>Result: </b>
          {lastTest.result}
        </p>
      </>
    );
    return (
      <>
        {legendIsh}
        <RadioGroup
          buttons={[
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ]}
          selectedRadio={lastTestAnswer}
          onChange={(e) => {
            setIsFirstTest(false);
            setlastTestAnswer(e.target.value);
            if (e.target.value === "yes") {
              // Fill in last test info using this data
              // TODO: update when test history has test type
              setPriorTestType("2");
              setPriorTestDate((lastTest.dateTested || "").split("T")[0]);
              setPriorTestResult(lastTest?.result);
            } else {
              setPriorTestType(undefined);
              setPriorTestDate(undefined);
              setPriorTestResult(undefined);
            }
          }}
          legend="Was this your most recent COVID-19 test?"
          legendSrOnly
          name="most_recent_flag"
          variant="horizontal"
        />
        {lastTestAnswer === "no" && previousTestEntry}
      </>
    );
  }

  return (
    <>
      <div className="usa-legend">
        Is this your first COVID-19 test?
        <Optional />
      </div>
      <div className="prime-previous-test-display margin-top-2">
        No previous test data found
      </div>

      <RadioGroup
        buttons={[
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
        ]}
        selectedRadio={
          isFirstTest === true ? "yes" : isFirstTest === false ? "no" : ""
        }
        onChange={(e) => {
          setIsFirstTest(e.target.value === "yes");
        }}
        legend="Is this your first covid test?"
        legendSrOnly
        name="prior_test_flag"
        variant="horizontal"
      />
      {isFirstTest === false && previousTestEntry}
    </>
  );
};

export default PriorTestInputs;
