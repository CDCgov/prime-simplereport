import React from "react";
import moment from "moment";
import { Label, Textarea } from "@trussworks/react-uswds";

import TextInput from "../commonComponents/TextInput";
import RadioGroup, { RadioGroupOptions } from "../commonComponents/RadioGroup";
import { TEST_RESULTS } from "../testResults/constants";
import { formatDate } from "../utils/date";
import "./TestDetailSection.scss";
import { ResultScaleType, TestDetailsInput } from "../../generated/graphql";

import { ResultScaleTypeOptions } from "./LabReportFormUtils";

type TestDetailSectionProps = {
  testDetails: TestDetailsInput;
  updateTestDetails: (details: TestDetailsInput) => void;
};

const ordinalResultButtons: RadioGroupOptions<string> = [
  {
    value: TEST_RESULTS.POSITIVE,
    label: `Positive (+)`,
  },
  {
    value: TEST_RESULTS.NEGATIVE,
    label: `Negative (-)`,
  },
  {
    value: TEST_RESULTS.UNDETERMINED,
    label: `Undetermined`,
  },
];

const TestDetailSection = ({
  testDetails,
  updateTestDetails,
}: TestDetailSectionProps) => {
  return (
    <>
      <div className="grid-row grid-gap flex-justify">
        <div className="grid-col-auto">
          <h3 className={"font-sans-lg"}>
            Test Details - {testDetails.testPerformedLoincShortName}
          </h3>
        </div>
      </div>
      <div className="grid-row grid-gap">
        <div className="grid-col-4">
          <TextInput
            name={`test-detail-${testDetails.testPerformedLoinc}-test-result-date`}
            type="date"
            label="Test result date"
            min={formatDate(new Date("Jan 1, 2020"))}
            max={formatDate(moment().toDate())}
            value={formatDate(moment(testDetails.resultDate).toDate())}
            onChange={(e) => {
              updateTestDetails({
                ...testDetails,
                resultDate: e.target.value,
              });
            }}
          ></TextInput>
        </div>
        <div className="grid-col-4">
          <TextInput
            name={`test-detail-${testDetails.testPerformedLoinc}-test-result-time`}
            type="time"
            label="Test result time"
            step="60"
            value={testDetails.resultTime ?? ""}
            onChange={(e) => {
              updateTestDetails({
                ...testDetails,
                resultTime: e.target.value,
              });
            }}
          ></TextInput>
        </div>
      </div>
      <div className="grid-row grid-gap">
        <div className="grid-col-4">
          <RadioGroup<ResultScaleType>
            legend="Type of test result"
            name={`test-detail-${testDetails.testPerformedLoinc}-test-result-type`}
            onChange={(value) =>
              updateTestDetails({
                ...testDetails,
                resultType: value,
              })
            }
            buttons={ResultScaleTypeOptions}
            selectedRadio={testDetails.resultType}
            required={true}
          />
        </div>
        {testDetails.resultType === ResultScaleType.Ordinal ? (
          <div className="grid-col-4">
            <RadioGroup<string>
              legend={`Test result`}
              buttons={ordinalResultButtons}
              name={`test-detail-${testDetails.testPerformedLoinc}-test-result-value`}
              selectedRadio={testDetails.resultValue}
              required={true}
              onChange={(value) =>
                updateTestDetails({ ...testDetails, resultValue: value })
              }
            />
          </div>
        ) : undefined}
        {testDetails.resultType === ResultScaleType.Quantitative ||
        testDetails.resultType === ResultScaleType.Nominal ? (
          <div className="grid-col-4">
            <TextInput
              name={`test-detail-${testDetails.testPerformedLoinc}-test-result-value`}
              type={"text"}
              label={`Test result`}
              onChange={(e) =>
                updateTestDetails({
                  ...testDetails,
                  resultValue: e.target.value,
                })
              }
              value={testDetails.resultValue}
              required={true}
            ></TextInput>
          </div>
        ) : undefined}
      </div>
      <div className="grid-row grid-gap">
        <div className="grid-col-8">
          <div className="usa-form-group">
            <Label
              htmlFor={`test-detail-${testDetails.testPerformedLoinc}-test-result-interpretation`}
            >
              Test result interpretation
            </Label>
            <Textarea
              id={`test-detail-${testDetails.testPerformedLoinc}-test-result-interpretation`}
              name={`test-detail-${testDetails.testPerformedLoinc}-test-result-interpretation`}
              className={"interpretation-textarea"}
              onChange={(e) =>
                updateTestDetails({
                  ...testDetails,
                  resultInterpretation: e.target.value,
                })
              }
              maxLength={10000}
              value={testDetails.resultInterpretation ?? ""}
            ></Textarea>
          </div>
        </div>
      </div>
    </>
  );
};

export default TestDetailSection;
