import React from "react";
import moment from "moment";
import { Label, Textarea } from "@trussworks/react-uswds";

import TextInput from "../commonComponents/TextInput";
import RadioGroup, { RadioGroupOptions } from "../commonComponents/RadioGroup";
import { TEST_RESULTS } from "../testResults/constants";
import { formatDate } from "../utils/date";

import "./TestDetailSection.scss";
import { UniversalTestDetails } from "./types";
import { ResultScaleType, ResultScaleTypeOptions } from "./LabReportFormUtils";

type TestDetailSectionProps = {
  testDetails: UniversalTestDetails;
  updateTestDetails: (details: UniversalTestDetails) => void;
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

export const TestDetailSection = ({
  testDetails,
  updateTestDetails,
}: TestDetailSectionProps) => {
  return (
    <>
      <div className="grid-row grid-gap">
        <div className="grid-col-12">
          <h3 className={"font-sans-md"}>
            {testDetails.condition} Test Details
          </h3>
        </div>
      </div>
      <div className="grid-row grid-gap">
        <div className="grid-col-auto">
          <TextInput
            name={`condition-${testDetails.condition}-test-loinc-short-name`}
            type={"text"}
            label={"Test name"}
            onChange={(e) =>
              updateTestDetails({
                ...testDetails,
                loinc_short_name: e.target.value,
              })
            }
            value={testDetails.loinc_short_name}
          ></TextInput>
        </div>
        <div className="grid-col-auto">
          <TextInput
            name={`condition-${testDetails.condition}-test-loinc-code`}
            type={"text"}
            label={"Test LOINC code"}
            onChange={(e) =>
              updateTestDetails({
                ...testDetails,
                loinc_code: e.target.value,
              })
            }
            value={testDetails.loinc_code}
          ></TextInput>
        </div>

        <div className="grid-col-auto">
          <TextInput
            name={`condition-${testDetails.condition}-test-result-date`}
            type="date"
            label="Test result date"
            min={formatDate(new Date("Jan 1, 2020"))}
            max={formatDate(moment().toDate())}
            value={formatDate(moment(testDetails.result_date).toDate())}
            onChange={(e) => {
              updateTestDetails({
                ...testDetails,
                result_date: e.target.value,
              });
            }}
          ></TextInput>
        </div>
        <div className="grid-col-auto">
          <TextInput
            name={`condition-${testDetails.condition}-test-result-time`}
            type="time"
            label="Test result time"
            step="60"
            value={testDetails.result_time}
            onChange={(e) => {
              updateTestDetails({
                ...testDetails,
                result_time: e.target.value,
              });
            }}
          ></TextInput>
        </div>
      </div>
      <div className="grid-row grid-gap">
        <div className="grid-col-auto">
          <RadioGroup<ResultScaleType>
            legend="Type of test result"
            name={`condition-${testDetails.condition}-test-result-type`}
            onChange={(value) =>
              updateTestDetails({ ...testDetails, result_type: value })
            }
            buttons={ResultScaleTypeOptions}
            selectedRadio={testDetails.result_type}
            required={true}
          />
        </div>
        {testDetails.result_type === ResultScaleType.ORDINAL ? (
          <div className="grid-col-auto">
            <RadioGroup<string>
              legend={`${testDetails.condition} test result`}
              buttons={ordinalResultButtons}
              name={`condition-${testDetails.condition}-test-result-value`}
              selectedRadio={testDetails.result_value}
              required={true}
              onChange={(value) =>
                updateTestDetails({ ...testDetails, result_value: value })
              }
            />
          </div>
        ) : undefined}
        {testDetails.result_type === ResultScaleType.QUANTITATIVE ||
        testDetails.result_type === ResultScaleType.NOMINAL ? (
          <div className="grid-col-auto">
            <TextInput
              name={`condition-${testDetails.condition}-test-result-value`}
              type={"text"}
              label={`${testDetails.condition} test result`}
              onChange={(e) =>
                updateTestDetails({
                  ...testDetails,
                  result_value: e.target.value,
                })
              }
              value={testDetails.result_value}
              required={true}
            ></TextInput>
          </div>
        ) : undefined}
        <div className="grid-col-auto">
          <div className="usa-form-group">
            <Label
              htmlFor={`condition-${testDetails.condition}-test-result-interpretation`}
            >
              Test result interpretation
            </Label>
            <Textarea
              id={`condition-${testDetails.condition}-test-result-interpretation`}
              name={`condition-${testDetails.condition}-test-result-interpretation`}
              className={"interpretation-textarea"}
              onChange={(e) =>
                updateTestDetails({
                  ...testDetails,
                  result_interpretation: e.target.value,
                })
              }
              maxLength={10000}
              value={testDetails.result_interpretation}
            ></Textarea>
          </div>
        </div>
      </div>
    </>
  );
};
